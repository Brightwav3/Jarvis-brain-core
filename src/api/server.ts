import { createServer, type Server } from 'node:http';
import { createOk } from '../core/contracts.js';
import { HealthService } from '../observability/health.js';
import type { ComponentRecord } from '../components/contracts.js';

type Dependencies = { identity: string; version: string; status(): unknown; components(): ComponentRecord[] };
export class LocalApiServer {
  #server: Server | undefined;
  constructor(private readonly dependencies: Dependencies) {}
  async start(port: number, host = '127.0.0.1'): Promise<{ port: number }> {
    const health = new HealthService(this.dependencies.components);
    this.#server = createServer((request, response) => {
      const data = request.url === '/health' ? health.status() : request.url === '/status' ? this.dependencies.status() : request.url === '/components' ? this.dependencies.components() : request.url === '/version' ? { identity: this.dependencies.identity, version: this.dependencies.version } : undefined;
      response.setHeader('content-type', 'application/json');
      if (data === undefined) { response.statusCode = 404; response.end(JSON.stringify({ ok: false, error: { code: 'ROUTE_NOT_FOUND', message: 'Route not found', context: { path: request.url }, remediation: 'Use a documented local route' } })); return; }
      response.end(JSON.stringify(createOk(data)));
    });
    await new Promise<void>((resolve, reject) => { this.#server!.once('error', reject); this.#server!.listen(port, host, resolve); });
    return { port: (this.#server.address() as { port: number }).port };
  }
  async stop(): Promise<void> { if (this.#server) await new Promise<void>((resolve, reject) => this.#server!.close((error) => error ? reject(error) : resolve())); }
}
