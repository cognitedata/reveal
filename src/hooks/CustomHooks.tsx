import { useEffect, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'reducers/index';
import { useHistory } from 'react-router-dom';

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

export const useScopedHistory = () => {
  const tenant = useTenant();
  const history = useHistory();

  return useMemo(
    () => ({
      ...history,
      push: (path: string) =>
        history.push(
          `/${tenant}/${path.charAt(0) === '/' ? path.substr(1) : path}`
        ),
      replace: (path: string) =>
        history.replace(
          `/${tenant}/${path.charAt(0) === '/' ? path.substr(1) : path}`
        ),
    }),
    [tenant, history]
  );
};
