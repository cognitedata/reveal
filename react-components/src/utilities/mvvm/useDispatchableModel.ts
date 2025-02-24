/*!
 * Copyright 2025 Cognite AS
 */
import { useEffect, useRef } from 'react';
import { type Disposable } from './Dispatchable';

export function useDispatchableModel<T extends Disposable, U extends unknown[]>(
  ModelConstructor: new (...args: U) => T,
  ...args: U
): T {
  const modelRef = useRef(new ModelConstructor(...args));

  useEffect(
    () => () => {
      modelRef.current.dispose();
    },
    []
  );

  return modelRef.current;
}
