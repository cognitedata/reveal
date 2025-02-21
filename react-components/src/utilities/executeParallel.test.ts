/*!
 * Copyright 2025 Cognite AS
 */
import { describe, expect, test } from 'vitest';
import { executeParallel } from './executeParallel';
import { delay } from 'lodash';

describe(executeParallel.name, () => {
  test('one call finishes', async () => {
    const result = await executeParallel([async () => await Promise.resolve(0)], 1);

    expect(result).toEqual([0]);
  });

  test('one call with multiple parallel finishes', async () => {
    const result = await executeParallel([async () => await Promise.resolve(0)], 3);

    expect(result).toEqual([0]);
  });

  test('two calls with one parallel finishes', async () => {
    const results = await executeParallel(
      [async () => await Promise.resolve(0), async () => await Promise.resolve(1)],
      1
    );

    expect(results).toEqual([0, 1]);
  });

  test('three calls with two parallel finishes', async () => {
    const results = await executeParallel(
      [
        async () => await Promise.resolve(0),
        async () => await Promise.resolve(1),
        async () => await Promise.resolve(2)
      ],
      2
    );

    expect(results).toEqual([0, 1, 2]);
  });

  test('two calls with three parallel finishes', async () => {
    const results = await executeParallel(
      [async () => await Promise.resolve(0), async () => await Promise.resolve(1)],
      3
    );

    expect(results).toEqual([0, 1]);
  });

  test('two calls with delay in first resolves with results in right order', async () => {
    const results = await executeParallel(
      [
        async () =>
          await new Promise((resolve) =>
            delay(() => {
              resolve(0);
            }, 200)
          ),
        async () => await Promise.resolve(1)
      ],
      2
    );

    expect(results).toEqual([0, 1]);
  });
});
