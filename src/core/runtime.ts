import type { RuntimeComponent } from '../components/contracts.js';
import { ComponentRegistry } from '../components/registry.js';
import { EventBus } from '../events/event-bus.js';
import { LocalApiServer } from '../api/server.js';
import { createLogger } from '../observability/logger.js';

export type RuntimeState = 'idle' | 'starting' | 'running' | 'stopping' | 'stopped' | 'failed';
export type RuntimeStatus = { identity: string; state: RuntimeState; api?: { host: string; port: number } };
type RuntimeOptions = { identity: string; api?: { host: string; port: number; version: string }; components?: RuntimeComponent[] };

export class CoreRuntime {
  #state: RuntimeState = 'idle';
  #events: EventBus;
  #registry: ComponentRegistry;
  #api: LocalApiServer | undefined;
  #apiAddress: { host: string; port: number } | undefined;

  constructor(private readonly options: RuntimeOptions) {
    const logger = createLogger(options.identity);
    this.#events = new EventBus((failure) => logger.error({ event: 'event.delivery_failed', event_type: failure.eventType, error: failure.error }));
    this.#registry = new ComponentRegistry(this.#events);
    for (const component of options.components ?? []) this.#registry.register(component);
  }

  async start(): Promise<void> {
    if (this.#state !== 'idle') throw new Error(`Runtime cannot start from state ${this.#state}`);
    this.#state = 'starting';
    await this.#events.publish({ type: 'core.starting', source: this.options.identity, timestamp: new Date().toISOString() });
    try {
      await this.#registry.startAll();
      if (this.options.api) {
        this.#api = new LocalApiServer({ identity: this.options.identity, version: this.options.api.version, status: () => this.status(), components: () => this.#registry.list() });
        const address = await this.#api.start(this.options.api.port, this.options.api.host);
        this.#apiAddress = { host: this.options.api.host, port: address.port };
      }
      this.#state = 'running';
      await this.#events.publish({ type: 'core.started', source: this.options.identity, timestamp: new Date().toISOString() });
    } catch (error) { this.#state = 'failed'; throw error; }
  }

  async stop(_reason: string): Promise<void> {
    if (this.#state === 'stopped') return;
    this.#state = 'stopping';
    await this.#events.publish({ type: 'core.stopping', source: this.options.identity, timestamp: new Date().toISOString() });
    await this.#api?.stop();
    await this.#registry.stopAll();
    this.#state = 'stopped';
    await this.#events.publish({ type: 'core.stopped', source: this.options.identity, timestamp: new Date().toISOString() });
  }

  status(): RuntimeStatus { return { identity: this.options.identity, state: this.#state, ...(this.#apiAddress ? { api: this.#apiAddress } : {}) }; }
}
