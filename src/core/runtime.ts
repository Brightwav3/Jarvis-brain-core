export type RuntimeState =
  | 'idle'
  | 'starting'
  | 'running'
  | 'stopping'
  | 'stopped'
  | 'failed';

export type RuntimeStatus = {
  identity: string;
  state: RuntimeState;
};

export class CoreRuntime {
  #state: RuntimeState = 'idle';

  constructor(private readonly options: { identity: string }) {}

  async start(): Promise<void> {
    if (this.#state !== 'idle') {
      throw new Error(`Runtime cannot start from state ${this.#state}`);
    }

    this.#state = 'starting';
    this.#state = 'running';
  }

  async stop(_reason: string): Promise<void> {
    if (this.#state === 'stopped') {
      return;
    }

    this.#state = 'stopping';
    this.#state = 'stopped';
  }

  status(): RuntimeStatus {
    return { identity: this.options.identity, state: this.#state };
  }
}
