import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from 'react-query';
import { useHistory, useLocation } from 'react-router-dom';
import qs from 'query-string';

import { Chart } from 'reducers/charts/types';
import { omit } from 'lodash';

export const useLoginStatus = () => {
  const sdk = useSDK();
  return useQuery(['login', 'status'], () => sdk.login.status(), {
    cacheTime: Infinity,
  });
};

export const useIsChartOwner = (chart: Chart) => {
  const { data: login } = useLoginStatus();
  return login?.user === chart.user;
};

export const useSearchParam = (
  name: string,
  pushState = true
): [string | undefined, (s?: string) => void] => {
  const history = useHistory();
  const { location } = history;
  const search = qs.parse(location.search);
  let val = search[name];

  if (val && Array.isArray(val)) {
    [val] = val;
  }

  const setSearchParam = (newVal?: string) => {
    const newSearch = newVal
      ? {
          ...search,
          [name]: newVal,
        }
      : omit(search, name);

    history[pushState ? 'push' : 'replace']({
      pathname: location.pathname,
      search: qs.stringify(newSearch),
      hash: location.hash,
      state: location.state,
    });
  };
  return [val ? decodeURIComponent(val) : undefined, setSearchParam];
};

const sanitizeTenant = (tenant: string = '') =>
  tenant.toLowerCase().replace(/[^a-z0-9-]/g, '');

export const getProject = () =>
  sanitizeTenant(window.location.pathname.match(/^\/([^/]*)(.*)$/)?.[1]);

export const useProject = () => {
  const location = useLocation();
  return sanitizeTenant(location.pathname.match(/^\/([^/]*)(.*)$/)?.[1]);
};

export const useNavigate = () => {
  const history = useHistory();
  const tenant = sanitizeTenant(
    history.location.pathname.match(/^\/([^/]*)(.*)$/)?.[1]
  );

  return (path: string, pushState = true) => {
    const newPath = `/${tenant}${path}`;

    history[
      pushState && newPath !== history.location.pathname ? 'push' : 'replace'
    ]({
      ...history.location,
      pathname: newPath,
    });
  };
};

export const useClearSearchParams = (
  keys: string[],
  pushState: boolean = true
) => {
  const history = useHistory();
  const { location } = history;
  const search = qs.parse(location.search);

  return () => {
    history[pushState ? 'push' : 'replace']({
      pathname: location.pathname,
      search: qs.stringify(omit(search, keys)),
      hash: location.hash,
      state: location.state,
    });
  };
};
