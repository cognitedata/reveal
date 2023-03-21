import { renderHook } from '@testing-library/react-hooks';
import { useDeepEffect } from '../useDeep';

//TODO Move this in fixture
const tests = [
  {
    description: 'number dependencies',
    expectation: 'runs the callback',
    initialDeps: [1, 2],
    finalDeps: [2, 2],
    calledTimes: 1,
    finalCalledTimes: 2,
  },
  {
    description: 'number dependencies',
    expectation: 'does not run the callback',
    initialDeps: [1, 2],
    finalDeps: [1, 2],
    calledTimes: 1,
    finalCalledTimes: 1,
  },
  {
    description: 'string dependencies',
    expectation: 'runs the callback',
    initialDeps: ['foo', 'bar'],
    finalDeps: ['foo', 'baz'],
    calledTimes: 1,
    finalCalledTimes: 2,
  },
  {
    description: 'string dependencies',
    expectation: 'does not run the callback',
    initialDeps: ['foo', 'bar'],
    finalDeps: ['foo', 'bar'],
    calledTimes: 1,
    finalCalledTimes: 1,
  },
  {
    description: 'object dependencies',
    expectation: 'runs the callback',
    initialDeps: [{ foo: 'bar' }],
    finalDeps: [{ foo: 'baz' }],
    calledTimes: 1,
    finalCalledTimes: 2,
  },
  {
    description: 'object dependencies',
    expectation: 'does not run the callback',
    initialDeps: [{ foo: 'bar' }],
    finalDeps: [{ foo: 'bar' }],
    calledTimes: 1,
    finalCalledTimes: 1,
  },
  {
    description: 'array of objects dependencies',
    expectation: 'runs the callback',
    initialDeps: [[{ foo: 'bar' }]],
    finalDeps: [[{ foo: 'baz' }]],
    calledTimes: 1,
    finalCalledTimes: 2,
  },
  {
    description: 'array of objects dependencies',
    expectation: 'does not run the callback',
    initialDeps: [{ foo: 'bar' }],
    finalDeps: [{ foo: 'bar' }],
    calledTimes: 1,
    finalCalledTimes: 1,
  },
  {
    description: 'Set dependencies',
    expectation: 'runs the callback',
    initialDeps: [new Set([1, 2])],
    finalDeps: [new Set([2, 2])],
    calledTimes: 1,
    finalCalledTimes: 2,
  },
  {
    description: 'Set dependencies',
    expectation: 'does not run the callback',
    initialDeps: [new Set([1, 2])],
    finalDeps: [new Set([1, 2])],
    calledTimes: 1,
    finalCalledTimes: 1,
  },
  {
    description: 'Map dependencies',
    expectation: 'runs the callback',
    initialDeps: [new Map([[1, 'one']])],
    finalDeps: [new Map([[2, 'two']])],
    calledTimes: 1,
    finalCalledTimes: 2,
  },
  {
    description: 'Map dependencies',
    expectation: 'does not run the callback',
    initialDeps: [new Map([[1, 'one']])],
    finalDeps: [new Map([[1, 'one']])],
    calledTimes: 1,
    finalCalledTimes: 1,
  },
  {
    description: 'undefined dependencies',
    expectation: 'runs the callback',
    initialDeps: [undefined],
    finalDeps: [1],
    calledTimes: 1,
    finalCalledTimes: 2,
  },
  {
    description: 'undefined dependencies',
    expectation: 'does not run the callback',
    initialDeps: [undefined],
    finalDeps: [undefined],
    calledTimes: 1,
    finalCalledTimes: 1,
  },
  {
    description: 'null dependencies',
    expectation: 'runs the callback',
    initialDeps: [null],
    finalDeps: [1],
    calledTimes: 1,
    finalCalledTimes: 2,
  },
  {
    description: 'null dependencies',
    expectation: 'does not run the callback',
    initialDeps: [null],
    finalDeps: [null],
    calledTimes: 1,
    finalCalledTimes: 1,
  },
  {
    description: 'NaN dependencies',
    expectation: 'runs the callback',
    initialDeps: [NaN],
    finalDeps: [1],
    calledTimes: 1,
    finalCalledTimes: 2,
  },
  {
    description: 'NaN dependencies',
    expectation: 'does not run the callback',
    initialDeps: [NaN],
    finalDeps: [NaN],
    calledTimes: 1,
    finalCalledTimes: 1,
  },
];

describe('deeps hooks', () => {
  describe('useDeepEffect', () => {
    tests.forEach((aTest) => {
      describe(aTest.description, () => {
        it(aTest.expectation, () => {
          const fn = jest.fn();
          let dependencies = aTest.initialDeps;
          const { rerender } = renderHook(() =>
            useDeepEffect(fn, dependencies)
          );
          expect(fn).toHaveBeenCalledTimes(aTest.calledTimes);
          dependencies = aTest.finalDeps;
          rerender();

          expect(fn).toHaveBeenCalledTimes(aTest.finalCalledTimes);
        });
      });
    });
  });
});
