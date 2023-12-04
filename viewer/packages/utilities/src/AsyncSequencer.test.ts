/*!
 * Copyright 2023 Cognite AS
 */

import { AsyncSequencer } from './AsyncSequencer';

import { jest } from '@jest/globals';

describe(AsyncSequencer.name, () => {
  test("doesn't mix up calls in the right order", async () => {
    const asyncSequencer = new AsyncSequencer();

    const fn = jest.fn<(n: number) => void>();

    const sequencer1 = asyncSequencer.getNextSequencer();
    const sequencer2 = asyncSequencer.getNextSequencer();

    await sequencer1(() => fn(1));
    await sequencer2(() => fn(2));

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn.mock.calls[0][0]).toBe(1);
    expect(fn.mock.calls[1][0]).toBe(2);
  });

  test('reverses calls in the wrong order', async () => {
    const asyncSequencer = new AsyncSequencer();

    const fn = jest.fn<(n: number) => void>();

    const sequencer1 = asyncSequencer.getNextSequencer();
    const sequencer2 = asyncSequencer.getNextSequencer();
    const sequencer3 = asyncSequencer.getNextSequencer();

    const res2 = sequencer2(() => fn(2));
    const res3 = sequencer3(() => fn(3));
    const res1 = sequencer1(() => fn(1));

    await Promise.all([res2, res3, res1]);

    expect(fn).toHaveBeenCalledTimes(3);
    expect(fn.mock.calls[0][0]).toBe(1);
    expect(fn.mock.calls[1][0]).toBe(2);
    expect(fn.mock.calls[2][0]).toBe(3);
  });
});
