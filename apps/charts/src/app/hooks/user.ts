import { useUserInfo } from '@charts-app/hooks/useUserInfo';
import { Chart } from '@charts-app/models/chart/types';

export const useIsChartOwner = (chart?: Chart) => {
  const { data: login } = useUserInfo();

  if (!chart) {
    return false;
  }

  return login?.id === chart.user || login?.mail === chart.user;
};
