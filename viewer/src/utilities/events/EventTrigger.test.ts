/*!
 * Copyright 2021 Cognite AS
 */

import { EventTrigger } from './EventTrigger';

describe('EventTrigger', () => {
  test('fire() triggers subscribed listeners', () => {
    const listener: (arg1: string, arg2: number) => void = jest.fn();

    const source = new EventTrigger<(arg1: string, arg2: number) => void>();
    source.subscribe(listener);
    source.fire('hei', 1);

    expect(listener).toBeCalledWith('hei', 1);
  });

  test('fire() doesnt trigger unsubscribed listener', () => {
    const listener: () => void = jest.fn();

    const source = new EventTrigger<() => void>();
    source.subscribe(listener);
    source.unsubscribe(listener);
    source.fire();

    expect(listener).not.toBeCalled();
  });

  test('fire() doesnt trigger after unsubscribeAll()', () => {
    const listener: () => void = jest.fn();

    const source = new EventTrigger<() => void>();
    source.subscribe(listener);
    source.unsubscribeAll();
    source.fire();

    expect(listener).not.toBeCalled();
  });
});
