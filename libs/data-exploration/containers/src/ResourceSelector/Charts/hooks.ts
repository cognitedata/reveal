import { getProject } from '@cognite/cdf-utilities';
import { useListPublicCharts, useListUserCharts } from '@cognite/charts-lib';

import { InternalChartsFilters } from '@data-exploration-lib/core';

import { getFilteredChartsData } from './utils';

export const useFilteredChartsData = ({ isPublic }: InternalChartsFilters) => {
  const project = getProject();
  const { data: publicCharts = [], isLoading: isPublicChartsLoading } =
    useListPublicCharts({ projectId: project });
  const { data: userCharts = [], isLoading: isUserChartsLoading } =
    useListUserCharts({ projectId: project });

  const data = getFilteredChartsData({
    userCharts,
    publicCharts,
    filter: { isPublic },
  });

  const isChartsLoading = isUserChartsLoading || isPublicChartsLoading;
  return { data, isChartsLoading };
};
