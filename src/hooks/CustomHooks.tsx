import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'reducers/index';

export function usePrevious<T>(value: T) {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current as T;
}
export const useTenant = () => {
  return useSelector((state: RootState) => state.app.tenant);
};
