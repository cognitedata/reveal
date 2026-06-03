/*!
 * Copyright 2021 Cognite AS
 */

import { EventTrigger } from './EventTrigger';

import { vi } from 'vitest';

describe('EventTrigger', () => {
  test('fire() triggers subscribed listeners', () => {
    const listener: (arg1: string, arg2: number) => void = vi.fn();

    const source = new EventTrigger<(arg1: string, arg2: number) => void>();
    source.subscribe(listener);
    source.fire('hei', 1);

    expect(listener).toHaveBeenCalledWith('hei', 1);
  });

  test('fire() doesnt trigger unsubscribed listener', () => {
    const listener: () => void = vi.fn();

    const source = new EventTrigger<() => void>();
    source.subscribe(listener);
    source.unsubscribe(listener);
    source.fire();

    expect(listener).not.toHaveBeenCalled();
  });

  test('fire() doesnt trigger after unsubscribeAll()', () => {
    const listener: () => void = vi.fn();

    const source = new EventTrigger<() => void>();
    source.subscribe(listener);
    source.unsubscribeAll();
    source.fire();

    expect(listener).not.toHaveBeenCalled();
  });
});
