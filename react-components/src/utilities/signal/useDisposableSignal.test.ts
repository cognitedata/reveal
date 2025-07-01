import { describe, expect, test, vi } from 'vitest';
import { useDisposableSignal } from './useDisposableSignal';
import { renderHook } from '@testing-library/react';
import { signal } from '@cognite/signals';
import { type DisposableSignal } from './DisposableSignal';

describe(useDisposableSignal.name, () => {
  test('returns signal value', () => {
    const signalResult = 42;

    const disposableSignal: DisposableSignal<number> = {
      signal: signal(() => signalResult),
      dispose: () => {}
    };

    const { result } = renderHook(() => useDisposableSignal(disposableSignal));

    expect(result.current).toBe(signalResult);
  });

  test('calls dispose on unmount', () => {
    const disposableSignal = {
      signal: signal(() => 0),
      dispose: vi.fn()
    };

    const { unmount } = renderHook(() => useDisposableSignal(disposableSignal));

    expect(disposableSignal.dispose).not.toHaveBeenCalled();

    unmount();

    expect(disposableSignal.dispose).toHaveBeenCalledOnce();
  });

  test('returns stable reference across rerenders', () => {
    const disposableSignal: DisposableSignal<number[]> = {
      signal: signal(() => [42]),
      dispose: () => {}
    };

    const { result, rerender } = renderHook(() => useDisposableSignal(disposableSignal));

    const initialResult = result.current;

    rerender();

    expect(result.current).toBe(initialResult);
  });
});
