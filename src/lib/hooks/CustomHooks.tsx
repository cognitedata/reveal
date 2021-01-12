import { useEffect, useRef } from 'react';
import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import queryString from 'query-string';

export function usePrevious<T>(value: T) {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current as T;
}
export const useTenant = () => {
  const { tenant } = useParams<{ tenant: string }>();
  return tenant;
};

export const useEnv = (): string | undefined => {
  const param = queryString.parse(window.location.search).env;
  if (param instanceof Array) {
    return param[0];
  }
  if (typeof param === 'string') {
    return param;
  }
  return undefined;
};

export const useUserStatus = () => {
  const sdk = useSDK();
  return useQuery(['login'], () => sdk.login.status());
};
