import { useNavigate } from 'react-router-dom';
import { useComponentTranslations } from 'hooks/translations';
import useMyChartsList from 'hooks/charts/hooks/useMyChartsList';
import usePublicChartsList from 'hooks/charts/hooks/usePublicChartsList';
import { createInternalLink } from 'utils/link';
import { ComponentProps } from 'react';
import { trackUsage } from 'services/metrics';
import { EmptyStatePublicCharts } from 'components/EmptyStates';
import ChartList from '../ChartList';

type Props = {
  viewOption: ComponentProps<typeof ChartList>['viewOption'];
  sortOption: {
    label: string;
    value: 'updatedAt' | 'name' | 'owner';
  };
  searchTerm: string;
};

const PublicChartsList = ({ viewOption, sortOption, searchTerm }: Props) => {
  const move = useNavigate();
  const translations = useComponentTranslations(ChartList);
  const { loading, list, error } = usePublicChartsList({
    order: sortOption.value,
    searchTerm,
  });
  const { duplicatePublicChart } = useMyChartsList({
    order: 'updatedAt',
    searchTerm: '',
  });

  const handleDuplicate = async (chartId: string) => {
    trackUsage('ChartListPage.DuplicateChart', { chartId });
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
