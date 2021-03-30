import { useSDK } from '@cognite/sdk-provider';
import qs from 'query-string';
import { useQuery } from 'react-query';
import { useHistory } from 'react-router-dom';
import { Chart } from 'reducers/charts/types';

const getSetItem = (key: string, history: ReturnType<typeof useHistory>) => (
  newItem: string
) => {
  const search = qs.parse(history?.location?.search);
  history.push({
    pathname: history?.location?.pathname,
    search: qs.stringify({
      ...search,
      [key]: newItem !== '' ? newItem : undefined,
    }),
  });
};

export const useLoginStatus = () => {
  const sdk = useSDK();
  return useQuery(['login', 'status'], () => sdk.login.status());
};

export const useIsChartOwner = (chart: Chart) => {
  const { data: login } = useLoginStatus();
  return login?.user === chart.user;
};

export const useQueryString = (
  key: string
): { item: string; setItem: (_: string) => void } => {
  const history = useHistory();

  const search = qs.parse(history?.location?.search);
  const item = (search[key] || '') as string;

  return {
    item: decodeURIComponent(item),
    setItem: getSetItem(key, history),
  };
};
