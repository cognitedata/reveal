import { ComponentProps } from 'react';
import { useNavigate } from 'react-router-dom';

import { EmptyStateMyCharts } from '@charts-app/components/EmptyStates';
import useMyChartsList from '@charts-app/hooks/charts/hooks/useMyChartsList';
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

const MyChartsList = ({ sortOption, searchTerm, viewOption }: Props) => {
  const move = useNavigate();
  const translations = useComponentTranslations(ChartList);
  const { loading, error, list, duplicatePrivateChart, deleteChart } =
    useMyChartsList({
      property: sortOption.value,
      searchTerm,
      order: sortOption.order,
    });

  const handleDuplicate = async (chartId: string) => {
    trackUsage('ChartListPage.DuplicatePrivateChart', { chartId });
    const newId = await duplicatePrivateChart(chartId);
    move(createInternalLink(newId));
  };

  const handleDelete = (chartId: string) => {
    trackUsage('ChartListPage.DeleteChart', { chartId });
    deleteChart(chartId);
  };

  const handleChartClick = (chartId: string) => {
    move(createInternalLink(chartId));
  };

  return (
    <ChartList
      emptyState={<EmptyStateMyCharts />}
      error={error as string}
      loading={loading}
      viewOption={viewOption}
      list={list}
      onChartClick={handleChartClick}
      onChartDuplicateClick={handleDuplicate}
      onChartDeleteClick={handleDelete}
      translations={translations}
    />
  );
};

export default MyChartsList;
