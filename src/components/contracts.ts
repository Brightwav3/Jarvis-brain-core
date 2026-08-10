import type { HealthState } from '../core/contracts.js';
export type ComponentHealth = { state: HealthState; reason?: string };
export type RuntimeComponent = { id: string; name: string; version: string; required: boolean; start(): Promise<void>; stop(): Promise<void>; health(): ComponentHealth };
export type ComponentRecord = { id: string; name: string; version: string; required: boolean; state: 'registered' | 'running' | 'failed' | 'stopped'; health: ComponentHealth; reason?: string };
