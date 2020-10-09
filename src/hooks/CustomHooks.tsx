import { useEffect, useRef, useContext } from 'react';
import { SdkContext } from 'context/sdk';
import { useQuery } from 'react-query';
import { CogniteClient, SingleCogniteCapability } from '@cognite/sdk';
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
  const sdk = useContext(SdkContext)!;
  return useQuery(['login'], () => sdk.login.status());
};

const getGroups = async (sdk: CogniteClient) => {
  const groups = await sdk.groups.list();
  return groups.reduce(
    (prev, current) => {
      const a = {
        ...prev,
      };
      // @ts-ignore
      const { capabilities, permissions } = current;
      if (permissions) {
        a.assetsAcl = (a.assetsAcl || []).concat(permissions.accessTypes);
        a.filesAcl = (a.filesAcl || []).concat(permissions.accessTypes);
        a.timeSeriesAcl = (a.timeSeriesAcl || []).concat(
          permissions.accessTypes
        );
      }
      if (capabilities) {
        capabilities.forEach((capability: SingleCogniteCapability) => {
          Object.keys(capability).forEach(key => {
            if (a[key]) {
              // @ts-ignore
              capability[key].actions.forEach(el => {
                if (a[key].indexOf(el) === -1) {
                  a[key].push(el);
                }
              });
            } else {
              // @ts-ignore
              a[key] = capability[key].actions;
            }
          });
        });
      }
      return a;
    },
    { groupsAcl: ['LIST'] } as { [key: string]: string[] }
  );
};

export const usePermissions = (key: string, type?: string): boolean => {
  const sdk = useContext(SdkContext)!;
  const { data: groups = {} } = useQuery(['groups'], () => getGroups(sdk), {
    staleTime: 10000,
  });

  return (
    groups.groupsAcl &&
    groups[key] &&
    (type ? groups[key].includes(type) : true)
  );
};
