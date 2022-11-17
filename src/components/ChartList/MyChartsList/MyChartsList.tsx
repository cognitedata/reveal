import useMyChartsList from 'hooks/charts/hooks/useMyChartsList';
import { useNavigate } from 'react-router-dom';
import { useComponentTranslations } from 'hooks/translations';
import { createInternalLink } from 'utils/link';
import { ComponentProps } from 'react';
import { trackUsage } from 'services/metrics';
import { EmptyStateMyCharts } from 'components/EmptyStates';
import ChartList from '../ChartList';

type Props = {
  viewOption: ComponentProps<typeof ChartList>['viewOption'];
  sortOption: {
    label: string;
    value: 'updatedAt' | 'name' | 'owner';
  };
  searchTerm: string;
};

const MyChartsList = ({ sortOption, searchTerm, viewOption }: Props) => {
  const move = useNavigate();
  const translations = useComponentTranslations(ChartList);
  const { loading, error, list, duplicateChart, deleteChart } = useMyChartsList(
    { order: sortOption.value, searchTerm }
  );

  const handleDuplicate = async (chartId: string) => {
    trackUsage('ChartListPage.DuplicateChart', { chartId });
    const newId = await duplicateChart(chartId);
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
