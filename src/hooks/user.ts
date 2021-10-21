import { useUserInfo } from '@cognite/sdk-react-query-hooks';
import { Chart } from 'models/chart/types';

export const useIsChartOwner = (chart: Chart) => {
  const { data: login } = useUserInfo();
  return login?.id === chart.user;
};
