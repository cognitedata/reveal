import { Chart } from '@cognite/charts-lib';

import { InternalChartsFilters } from '@data-exploration-lib/core';

export const getFilteredChartsData = ({
  userCharts,
  publicCharts,
  filter,
}: {
  userCharts: Chart[];
  publicCharts: Chart[];
  filter: InternalChartsFilters;
}) => {
  const { isPublic } = filter;
  if (isPublic === undefined) {
    return [...userCharts, ...publicCharts];
  }
  if (isPublic) {
    return [...publicCharts];
  } else {
    return [...userCharts];
  }
};

export const getQueriedChartsData = (
  chartsData: Chart[],
  chartsQuery: string
) => {
  return chartsData.filter(
    (chart) =>
      chart.name.toLowerCase().includes(chartsQuery.toLowerCase()) ||
      chart.userInfo?.displayName
        ?.toLowerCase()
        .includes(chartsQuery.toLowerCase())
  );
};
