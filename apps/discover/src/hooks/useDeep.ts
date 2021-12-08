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

export const useDeepCallback = (
  callback: EffectCallback,
  deps: DependencyList
) => {
  return useCallback(callback, useCompare(deps));
};

export const useDeepEffect = (effect: EffectCallback, deps: DependencyList) => {
  useEffect(effect, useCompare(deps));
};

export const useDeepMemo = <T>(factory: () => T, deps: DependencyList) => {
  return useMemo<T>(factory, useCompare(deps));
};
