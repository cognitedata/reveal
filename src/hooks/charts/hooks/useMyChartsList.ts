import { useUserInfo } from 'hooks/useUserInfo';
import { useUpdateChart } from 'hooks/charts-storage';
import { filter, orderBy } from 'lodash';
import { Chart } from 'models/chart/types';
import { duplicate } from 'models/chart/updates';
import useDeleteMyChart from '../mutations/useDeleteMyChart';
import useMyCharts from '../queries/useMyCharts';

interface useMyChartsListProps {
  searchTerm: string;
  order: 'updatedAt' | 'name' | 'owner';
}

const useMyChartsList = ({ searchTerm, order }: useMyChartsListProps) => {
  const { data: login } = useUserInfo();
  const { data = [], isFetched, error } = useMyCharts();
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
