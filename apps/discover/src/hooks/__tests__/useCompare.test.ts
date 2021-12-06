import { useMemo } from 'react';

import { renderHook } from '@testing-library/react-hooks';

import { useCompare } from 'hooks/useCompare';

describe('useCompare hook', () => {
  it('should handle changing deps as expected', () => {
    let deps = [1, { a: 'b' }, true];

    const { rerender, result } = renderHook(() => useCompare(deps));

    expect(result.current).toEqual([1, { a: 'b' }, true]);

    // no change
    rerender();
    expect(result.current).toEqual([1, { a: 'b' }, true]);

    // no change (new object with same properties)
    deps = [1, { a: 'b' }, true];
    rerender();
    expect(result.current).toEqual([1, { a: 'b' }, true]);

    // change (new primitive value)
    deps = [2, { a: 'b' }, true];
    rerender();
    expect(result.current).toEqual([2, { a: 'b' }, true]);

    // no change
    rerender();
    expect(result.current).toEqual([2, { a: 'b' }, true]);

    // change (new primitive value)
    deps = [1, { a: 'b' }, false];
    rerender();
    expect(result.current).toEqual([1, { a: 'b' }, false]);

    // change (new properties on object)
    deps = [1, { a: 'c' }, false];
    rerender();
    expect(result.current).toEqual([1, { a: 'c' }, false]);
  });

  it('should re-call content only for valid deps changes', () => {
    let deps = [1, { a: 'b' }, true];
    const factory = jest.fn();
    const { rerender } = renderHook(() => useMemo(factory, useCompare(deps)));

    expect(factory).toHaveBeenCalledTimes(1);
    factory.mockClear();

    // no change
    rerender();
    expect(factory).toHaveBeenCalledTimes(0);
    factory.mockClear();

    // no change (new object with same properties)
    deps = [1, { a: 'b' }, true];
    rerender();
    expect(factory).toHaveBeenCalledTimes(0);
    factory.mockClear();

    // change (new primitive value)
    deps = [2, { a: 'b' }, true];
    rerender();
    expect(factory).toHaveBeenCalledTimes(1);
    factory.mockClear();

    // no change
    rerender();
    expect(factory).toHaveBeenCalledTimes(0);
    factory.mockClear();

    // change (new primitive value)
    deps = [1, { a: 'b' }, false];
    rerender();
    expect(factory).toHaveBeenCalledTimes(1);
    factory.mockClear();

    // change (new properties on object)
    deps = [1, { a: 'c' }, false];
    rerender();
    expect(factory).toHaveBeenCalledTimes(1);
    factory.mockClear();
  });
});
