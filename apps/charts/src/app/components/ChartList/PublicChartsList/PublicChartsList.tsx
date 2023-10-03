import { ComponentProps } from 'react';
import { useNavigate } from 'react-router-dom';

import useMyChartsList from '../../../hooks/charts/hooks/useMyChartsList';
import usePublicChartsList from '../../../hooks/charts/hooks/usePublicChartsList';
import { useComponentTranslations } from '../../../hooks/translations';
import { trackUsage } from '../../../services/metrics';
import { createInternalLink } from '../../../utils/link';
import { EmptyStatePublicCharts } from '../../EmptyStates';
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
