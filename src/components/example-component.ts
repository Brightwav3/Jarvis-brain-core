import type { RuntimeComponent } from './contracts.js';

export const createExampleComponent = (): RuntimeComponent => ({ id: 'example-component', name: 'Example component', version: '1.0.0', required: false, async start(): Promise<void> {}, async stop(): Promise<void> {}, health: () => ({ state: 'healthy' }) });
