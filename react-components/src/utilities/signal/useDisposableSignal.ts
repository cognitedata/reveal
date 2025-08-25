import { useSignalValue } from '@cognite/signals/react';
import { type DisposableSignal } from './DisposableSignal';
import { useEffect, useMemo } from 'react';

export function useDisposableSignal<T>(disposableSignal: DisposableSignal<T>): T {
  useEffect(() => {
    return disposableSignal.dispose;
  }, [disposableSignal]);

  const valueCallback = useSignalValue(disposableSignal.signal);
  return useMemo(() => valueCallback(), [valueCallback]);
}
