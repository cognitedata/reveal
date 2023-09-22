import { useUpdateChart } from '@charts-app/hooks/charts-storage';
import { useUserInfo } from '@charts-app/hooks/useUserInfo';
import { duplicateChart } from '@charts-app/models/chart/helpers';
import { filter, orderBy, isString } from 'lodash';

import { Chart } from '@cognite/charts-lib';

import useDeleteMyChart from '../mutations/useDeleteMyChart';
import useMyCharts from '../queries/useMyCharts';

interface useMyChartsListProps {
  searchTerm: string;
  property: 'updatedAt' | 'name' | 'owner';
  order?: 'asc' | 'desc';
}

const useMyChartsList = ({
  searchTerm,
  property,
  order = 'desc',
}: useMyChartsListProps) => {
  const { data: login } = useUserInfo();
  const { data = [], isFetched, error } = useMyCharts();
  const { mutateAsync: deleteChartInFirebase } = useDeleteMyChart();
  const { mutateAsync: createChartInFirebase } = useUpdateChart();

  const deleteChart = (chartId: string) => deleteChartInFirebase(chartId);

  const duplicatePrivateChart = async (chartId: string) => {
    const chartToDuplicate = data.find((chart) => chart.id === chartId);
    if (!chartToDuplicate) throw new Error('Chart to duplicate not found');
    const newChart = duplicateChart(
      chartToDuplicate.firebaseChart,
      chartToDuplicate.firebaseChart.userInfo!
    );
    await createChartInFirebase(newChart);
    return newChart.id;
  };

  const duplicatePublicChart = async (chart: Chart) => {
    const newChart = duplicateChart(chart, login!);
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
  const orderedList = orderBy(
    filteredList,
    (item) =>
      isString(item[property]) ? item[property].toLowerCase() : item[property],
    [order]
  );

  return {
    list: orderedList,
    loading: !isFetched,
    error,
    deleteChart,
    duplicatePrivateChart,
    duplicatePublicChart,
  };
};

export default useMyChartsList;
