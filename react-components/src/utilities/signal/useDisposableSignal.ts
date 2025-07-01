import { useSignalValue } from '@cognite/signals/react';
import { type DisposableSignal } from './DisposableSignal';
import { useEffect, useMemo } from 'react';

export function useDisposableSignal<T>(effectSignal: DisposableSignal<T>): T {
  useEffect(() => {
    return effectSignal.dispose;
  }, [effectSignal]);

  const valueCallback = useSignalValue(effectSignal.signal);
  return useMemo(() => valueCallback(), [valueCallback]);
}
