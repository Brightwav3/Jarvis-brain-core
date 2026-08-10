export type EventMap = {
  'core.starting': {};
  'core.started': {};
  'core.stopping': {};
  'core.stopped': {};
  'component.registered': { componentId: string };
  'component.failed': { componentId: string; error: string };
};
export type EventType = keyof EventMap;
export type EventEnvelope<K extends EventType = EventType> = { type: K; source: string; timestamp: string; request_id?: string } & EventMap[K];
export type DeliveryFailure = { eventType: EventType; error: string };
type Handler<K extends EventType> = (event: EventEnvelope<K>) => void | Promise<void>;

export class EventBus {
  #handlers = new Map<EventType, Set<Handler<EventType>>>();
  constructor(private readonly reportDeliveryFailure: (failure: DeliveryFailure) => void = () => undefined) {}
  subscribe<K extends EventType>(type: K, handler: Handler<K>): () => void {
    const handlers = this.#handlers.get(type) ?? new Set<Handler<EventType>>();
    handlers.add(handler as Handler<EventType>); this.#handlers.set(type, handlers);
    return () => handlers.delete(handler as Handler<EventType>);
  }
  async publish<K extends EventType>(event: EventEnvelope<K>): Promise<void> {
    for (const handler of this.#handlers.get(event.type) ?? []) {
      try { await handler(event); }
      catch (error) { this.reportDeliveryFailure({ eventType: event.type, error: error instanceof Error ? error.message : String(error) }); }
    }
  }
}
