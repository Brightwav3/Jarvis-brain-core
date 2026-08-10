export type EventEnvelope = { type: string; source: string; timestamp: string; request_id?: string; [key: string]: unknown };
type Handler = (event: EventEnvelope) => void | Promise<void>;

export class EventBus {
  #handlers = new Map<string, Set<Handler>>();
  subscribe(type: string, handler: Handler): () => void {
    const handlers = this.#handlers.get(type) ?? new Set<Handler>();
    handlers.add(handler); this.#handlers.set(type, handlers);
    return () => handlers.delete(handler);
  }
  async publish(event: EventEnvelope): Promise<void> {
    for (const handler of this.#handlers.get(event.type) ?? []) await handler(event);
  }
}
