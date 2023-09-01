import { ComponentProps } from 'react';
import { useNavigate } from 'react-router-dom';

import { EmptyStatePublicCharts } from '@charts-app/components/EmptyStates';
import useMyChartsList from '@charts-app/hooks/charts/hooks/useMyChartsList';
import usePublicChartsList from '@charts-app/hooks/charts/hooks/usePublicChartsList';
import { useComponentTranslations } from '@charts-app/hooks/translations';
import { trackUsage } from '@charts-app/services/metrics';
import { createInternalLink } from '@charts-app/utils/link';

import ChartList from '../ChartList';

type Props = {
  viewOption: ComponentProps<typeof ChartList>['viewOption'];
  sortOption: {
    label: string;
    value: 'updatedAt' | 'name' | 'owner';
    order?: 'asc' | 'desc';
  };
  searchTerm: string;
};

const PublicChartsList = ({ viewOption, sortOption, searchTerm }: Props) => {
  const move = useNavigate();
  const translations = useComponentTranslations(ChartList);
  const { loading, list, error } = usePublicChartsList({
    property: sortOption.value,
    searchTerm,
    order: sortOption.order,
  });
  const { duplicatePublicChart } = useMyChartsList({
    property: 'updatedAt',
    searchTerm: '',
  });

  const handleDuplicate = async (chartId: string) => {
    trackUsage('ChartListPage.DuplicatePublicChart', { chartId });
    const publicChart = list.find((c) => c.id === chartId);
    if (!publicChart) throw new Error('Public Chart not found');
    const newId = await duplicatePublicChart(publicChart.firebaseChart);
    move(createInternalLink(newId));
  };

  const handleChartClick = (chartId: string) => {
    move(createInternalLink(chartId));
  };

  return (
    <ChartList
      error={error as string}
      loading={loading}
      viewOption={viewOption}
      list={list}
      onChartClick={handleChartClick}
      onChartDuplicateClick={handleDuplicate}
      onChartDeleteClick={() => {}}
      translations={translations}
      readOnly
      emptyState={<EmptyStatePublicCharts />}
    />
  );
};

export default PublicChartsList;
