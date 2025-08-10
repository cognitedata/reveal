import { describe, expect, test, vi } from 'vitest';
import { DeferredFunction } from './DeferredFunction';

describe(DeferredFunction.name, () => {
  test('Should not be called', () => {
    const func = vi.fn();
    const deferredFunc = new DeferredFunction(func);

    deferredFunc.trigger();
    deferredFunc.trigger();
    deferredFunc.trigger();

    expect(func).toHaveBeenCalledTimes(0);
  });

  test('Should be called once when on idle', () => {
    vi.useFakeTimers();
    const func = vi.fn();
    const deferredFunc = new DeferredFunction(func);

    deferredFunc.trigger();
    deferredFunc.trigger();
    deferredFunc.trigger();

    // This simulate OnIdle
    vi.advanceTimersByTime(1);
    expect(func).toHaveBeenCalledTimes(1);
  });

  test('Should not be called when disposed', () => {
    vi.useFakeTimers();
    const func = vi.fn();
    const deferredFunc = new DeferredFunction(func);

    deferredFunc.dispose();
    deferredFunc.trigger();

    // This simulate OnIdle
    vi.advanceTimersByTime(1);
    expect(func).toHaveBeenCalledTimes(0);
  });
});
