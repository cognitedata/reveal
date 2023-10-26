import { Chart, useUserInfo } from '@cognite/charts-lib';

export const useIsChartOwner = (chart?: Chart) => {
  const { data: login } = useUserInfo();

  if (!chart) {
    return false;
  }

  return login?.id === chart.user || login?.mail === chart.user;
};
