import type { ComponentRecord } from '../components/contracts.js';
import type { HealthState } from '../core/contracts.js';
export type HealthReport = { state: HealthState; subsystems: Array<{ id: string; state: HealthState; reason?: string }> };
export class HealthService {
  constructor(private readonly components: () => ComponentRecord[]) {}
  status(): HealthReport {
    const subsystems = this.components().filter((component) => component.state === 'failed').map((component) => ({ id: component.id, state: component.required ? 'unhealthy' as const : 'degraded' as const, reason: component.reason }));
    return { state: subsystems.some((item) => item.state === 'unhealthy') ? 'unhealthy' : subsystems.length ? 'degraded' : 'healthy', subsystems };
  }
}
