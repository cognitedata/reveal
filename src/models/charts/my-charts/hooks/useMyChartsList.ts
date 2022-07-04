import { useUserInfo } from '@cognite/sdk-react-query-hooks';
import { useUpdateChart } from 'hooks/charts-storage';
import usePlotlyPropsPreview from 'hooks/usePlotlyPropsPreview';
import { filter, orderBy } from 'lodash';
import { duplicate } from 'models/charts/charts/selectors/updates';
import { Chart } from 'models/charts/charts/types/types';
import useDeleteMyChart from '../mutations/useDeleteMyChart';
import useMyCharts from '../queries/useMyCharts';

interface useMyChartsListProps {
  searchTerm: string;
  order: 'updatedAt' | 'name' | 'owner';
}

const useMyChartsList = ({ searchTerm, order }: useMyChartsListProps) => {
  const { data: login } = useUserInfo();
  const { data = [], isFetched, error } = useMyCharts();
  usePlotlyPropsPreview(data?.map((c) => c.firebaseChart) ?? []);
  const { mutateAsync: deleteChartInFirebase } = useDeleteMyChart();
  const { mutateAsync: createChartInFirebase } = useUpdateChart();

  const deleteChart = (chartId: string) => deleteChartInFirebase(chartId);

  const duplicateChart = async (chartId: string) => {
    const chartToDuplicate = data.find((chart) => chart.id === chartId);
    if (!chartToDuplicate) throw new Error('Chart to duplicate not found');
    const newChart = duplicate(
      chartToDuplicate.firebaseChart,
      chartToDuplicate.firebaseChart.userInfo!
    );
    await createChartInFirebase(newChart);
    return newChart.id;
  };

  const duplicatePublicChart = async (chart: Chart) => {
    const newChart = duplicate(chart, login!);
    await createChartInFirebase(newChart);
    return newChart.id;
  };

  /**
   * Derive filtered list
   */
  const filteredList = searchTerm
    ? filter(data, ({ name, owner, updatedAt }) =>
        [name, owner, updatedAt].some((field) =>
          field.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
        )
      )
    : data;

  /**
   * Derive ordered (and filtered) list
   */
  const orderedList = orderBy(filteredList, [order], ['desc']);

  return {
    list: orderedList,
    loading: !isFetched,
    error,
    deleteChart,
    duplicateChart,
    duplicatePublicChart,
  };
};

export default useMyChartsList;
