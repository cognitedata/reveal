/*!
 * Copyright 2025 Cognite AS
 */
import { signal, type Signal } from '@cognite/signals';
import { useEffect, useRef } from 'react';

export function useValueAsSignal<T>(value: T): Signal<T> {
  const signalRef = useRef(signal<T>(value));

  useEffect(() => {
    signalRef.current(value);
  }, [value]);

  return signalRef.current;
}
