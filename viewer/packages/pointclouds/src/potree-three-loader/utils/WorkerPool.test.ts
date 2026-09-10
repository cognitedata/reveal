/*!
 * Copyright 2026 Cognite AS
 */

import { vi } from 'vitest';
import * as Comlink from 'comlink';
import { AutoTerminatingWorker, WorkerPool } from './WorkerPool';

class MockWorker extends EventTarget implements Worker {
  private readonly _port1: MessagePort;
  private readonly _port2: MessagePort;

  onerror: ((this: AbstractWorker, ev: Event) => void) | null = null;
  onmessage: ((this: Worker, ev: MessageEvent) => void) | null = null;
  onmessageerror: ((this: Worker, ev: MessageEvent) => void) | null = null;

  constructor() {
    super();
    const { port1, port2 } = new MessageChannel();
    this._port1 = port1;
    this._port2 = port2;

    Comlink.expose((x: number) => x * 2, this._port2);

    this._port1.addEventListener('message', (event: MessageEvent) => {
      this.dispatchEvent(new MessageEvent('message', { data: event.data }));
    });
    this._port1.start();
  }

  postMessage(message: unknown, transfer: Transferable[]): void;
  postMessage(message: unknown, options?: StructuredSerializeOptions): void;
  postMessage(message: unknown, transferOrOptions?: Transferable[] | StructuredSerializeOptions): void {
    const transfer = Array.isArray(transferOrOptions) ? transferOrOptions : [];
    this._port1.postMessage(message, transfer);
  }

  terminate(): void {
    this._port1.close();
    this._port2.close();
  }
}

describe(AutoTerminatingWorker.name, () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  test('getComlinkProxy returns the same proxy instance on repeated calls', () => {
    const worker = new MockWorker();
    const autoWorker = new AutoTerminatingWorker(worker, 7000);

    const proxy1 = autoWorker.getComlinkProxy<(x: number) => number>();
    const proxy2 = autoWorker.getComlinkProxy<(x: number) => number>();

    expect(proxy1).toBe(proxy2);
  });

  test('cached proxy responds correctly across multiple sequential calls', async () => {
    const worker = new MockWorker();
    const autoWorker = new AutoTerminatingWorker(worker, 7000);

    const proxy = autoWorker.getComlinkProxy<(x: number) => number>();
    const result1 = await proxy(5);
    const result2 = await proxy(10);
    const result3 = await proxy(7);

    expect(result1).toBe(10);
    expect(result2).toBe(20);
    expect(result3).toBe(14);
  });

  test('markIdle terminates worker and cleans up proxy after idle timeout', () => {
    vi.useFakeTimers();
    const worker = new MockWorker();
    const terminateSpy = vi.spyOn(worker, 'terminate');
    const autoWorker = new AutoTerminatingWorker(worker, 7000);

    autoWorker.getComlinkProxy<(x: number) => number>();
    autoWorker.markIdle();

    expect(autoWorker.isTerminated).toBe(false);

    vi.advanceTimersByTime(7000);

    expect(autoWorker.isTerminated).toBe(true);
    expect(terminateSpy).toHaveBeenCalledTimes(1);
  });
});

describe(WorkerPool.name, () => {
  test('reused worker returns the same proxy and it remains functional', async () => {
    const pool = new WorkerPool<MockWorker>(1, MockWorker);

    const worker1 = await pool.getWorker();
    const proxy1 = worker1.getComlinkProxy<(x: number) => number>();
    expect(await proxy1(3)).toBe(6);
    pool.releaseWorker(worker1);

    const worker2 = await pool.getWorker();
    expect(worker2).toBe(worker1);

    const proxy2 = worker2.getComlinkProxy<(x: number) => number>();
    expect(proxy2).toBe(proxy1);

    expect(await proxy2(4)).toBe(8);
    pool.releaseWorker(worker2);
  });

  test('worker proxy stays functional after multiple pool acquire-release cycles', async () => {
    const pool = new WorkerPool<MockWorker>(1, MockWorker);

    for (let i = 1; i <= 5; i++) {
      const worker = await pool.getWorker();
      const proxy = worker.getComlinkProxy<(x: number) => number>();
      const result = await proxy(i);
      expect(result).toBe(i * 2);
      pool.releaseWorker(worker);
    }
  });
});
