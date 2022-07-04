import useMyChartsList from 'models/charts/my-charts/hooks/useMyChartsList';
import { useNavigate } from 'hooks/navigation';
import { useComponentTranslations } from 'hooks/translations';
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

const MyChartsList = ({ sortOption, searchTerm, viewOption }: Props) => {
  const move = useNavigate();
  const translations = useComponentTranslations(ChartList);
  const { loading, error, list, duplicateChart, deleteChart } = useMyChartsList(
    { order: sortOption.value, searchTerm }
  );

  const handleDuplicate = async (chartId: string) => {
    trackUsage('ChartListPage.DuplicateChart', { chartId });
    const newId = await duplicateChart(chartId);
    move(`/${newId}`);
  };

  const handleDelete = (chartId: string) => {
    trackUsage('ChartListPage.DeleteChart', { chartId });
    deleteChart(chartId);
  };

  return (
    <ChartList
      error={error as string}
      loading={loading}
      viewOption={viewOption}
      list={list}
      onChartClick={(chartId) => move(`/${chartId}`)}
      onChartDuplicateClick={handleDuplicate}
      onChartDeleteClick={handleDelete}
      translations={translations}
    />
  );
};

export default MyChartsList;
