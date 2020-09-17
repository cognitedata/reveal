import { useEffect, useRef } from 'react';
import { useResourcesSelector } from '@cognite/cdf-resources-store';
import { RootState } from 'reducers/index';

export function usePrevious<T>(value: T) {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current as T;
}
export const useTenant = () => {
  return useResourcesSelector((state: RootState) => state.app.tenant);
};
export const useEnv = () => {
  return useResourcesSelector((state: RootState) => state.app.cdfEnv);
};
