import { EventBus } from '../events/event-bus.js';
import type { ComponentHealth, ComponentRecord, RuntimeComponent } from './contracts.js';

const UNSTARTED: ComponentHealth = { state: 'degraded', reason: 'not started' };

export class ComponentRegistry {
  #entries: Array<{ component: RuntimeComponent; record: ComponentRecord }> = [];
  constructor(private readonly events: EventBus) {}
  register(component: RuntimeComponent): void {
    if (this.#entries.some(({ component: entry }) => entry.id === component.id)) throw new Error(`Duplicate component id: ${component.id}`);
    this.#entries.push({ component, record: { id: component.id, name: component.name, version: component.version, required: component.required, state: 'registered', health: UNSTARTED } });
    void this.events.publish({ type: 'component.registered', source: component.id, timestamp: new Date().toISOString(), componentId: component.id });
  }
  /** A required component that fails stops everything already started, so a failed startup leaves nothing running. */
  async startAll(): Promise<void> {
    for (const entry of this.#entries) try { await entry.component.start(); entry.record.state = 'running'; entry.record.health = await entry.component.health(); } catch (error) { entry.record.state = 'failed'; entry.record.reason = error instanceof Error ? error.message : String(error); entry.record.health = { state: 'unhealthy', reason: entry.record.reason }; await this.events.publish({ type: 'component.failed', source: entry.component.id, timestamp: new Date().toISOString(), componentId: entry.component.id, error: entry.record.reason }); if (entry.component.required) { await this.stopAll(); throw error; } }
  }
  async stopAll(): Promise<void> { for (const entry of [...this.#entries].reverse()) if (entry.record.state === 'running') { try { await entry.component.stop(); entry.record.state = 'stopped'; } catch (error) { entry.record.state = 'failed'; entry.record.reason = error instanceof Error ? error.message : String(error); } } }
  async list(): Promise<ComponentRecord[]> { return Promise.all(this.#entries.map(async ({ component, record }) => ({ ...record, health: record.state === 'failed' || record.state === 'registered' ? record.health : await component.health() }))); }
  async capabilities(): Promise<Record<string, Record<string, unknown>>> {
    const entries = await Promise.all(this.#entries.filter(({ component }) => component.capabilities).map(async ({ component }) => [component.id, await component.capabilities!()] as const));
    return Object.fromEntries(entries);
  }
}
