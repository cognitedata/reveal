import { useNavigate } from 'hooks/navigation';
import { useComponentTranslations } from 'hooks/translations';
import useMyChartsList from 'models/charts/my-charts/hooks/useMyChartsList';
import usePublicChartsList from 'models/charts/public-charts/hooks/usePublicChartsList';
import { ComponentProps } from 'react';
import { trackUsage } from 'services/metrics';
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
    move(`/${newId}`);
  };

  return (
    <ChartList
      error={error as string}
      loading={loading}
      viewOption={viewOption}
      list={list}
      onChartClick={(chartId) => move(`/${chartId}`)}
      onChartDuplicateClick={handleDuplicate}
      onChartDeleteClick={() => {}}
      translations={translations}
      readOnly
    />
  );
};

export default PublicChartsList;
