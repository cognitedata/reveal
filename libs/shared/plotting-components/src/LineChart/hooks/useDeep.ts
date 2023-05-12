/* eslint-disable react-hooks/exhaustive-deps */

import {
  DependencyList,
  EffectCallback,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import isEqual from 'lodash/isEqual';

export const useCompare = (deps: DependencyList) => {
  const ref = useRef<DependencyList>();

  if (!ref.current || !isEqual(ref.current, deps)) {
    ref.current = deps;
  }

  return ref.current;
};

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
