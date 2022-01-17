/*!
 * Copyright 2021 Cognite AS
 */

import { EmptyEvent } from '.';
import { EventTrigger } from './EventTrigger';

describe('EventTrigger', () => {
  test('fire() triggers subscribed listeners', () => {
    const listener: (event: { arg1: string; arg2: number }) => void = jest.fn();

    const source = new EventTrigger<{ arg1: string; arg2: number }>();
    source.subscribe(listener);
    source.fire({ arg1: 'hei', arg2: 1 });

    expect(listener).toBeCalledWith({ arg1: 'hei', arg2: 1 });
  });

  test('fire() doesnt trigger unsubscribed listener', () => {
    const listener: () => void = jest.fn();

    const source = new EventTrigger<EmptyEvent>();
    source.subscribe(listener);
    source.unsubscribe(listener);
    source.fire(null);

    expect(listener).not.toBeCalled();
  });

  test('fire() doesnt trigger after unsubscribeAll()', () => {
    const listener: () => void = jest.fn();

    const source = new EventTrigger<EmptyEvent>();
    source.subscribe(listener);
    source.unsubscribeAll();
    source.fire(null);

    expect(listener).not.toBeCalled();
  });
});
