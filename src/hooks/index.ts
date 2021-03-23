import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from 'react-query';
import { Chart } from 'reducers/charts/types';

export const useLoginStatus = () => {
  const sdk = useSDK();
  return useQuery(['login', 'status'], () => sdk.login.status());
};

export const useIsChartOwner = (chart: Chart) => {
  const { data: login } = useLoginStatus();
  return login?.user === chart.user;
};
