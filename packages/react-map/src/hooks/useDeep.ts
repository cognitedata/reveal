import {
  DependencyList,
  EffectCallback,
  useCallback,
  useEffect,
  useMemo,
} from 'react';

import { useCompare } from './useCompare';

/**
 * Wrappers for the default hooks in React.
 * Use when the dependencies are object or array.
 */

export const useDeepCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: DependencyList
): T => {
  return useCallback<T>(callback, useCompare(deps));
};

export const useDeepEffect = (
  effect: EffectCallback,
  deps: DependencyList
): void => {
  useEffect(effect, useCompare(deps));
};

export const useDeepMemo = <T>(factory: () => T, deps: DependencyList): T => {
  return useMemo<T>(factory, useCompare(deps));
};
