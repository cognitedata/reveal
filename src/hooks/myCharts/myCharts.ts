import { useSDK } from '@cognite/sdk-provider';
import { useUserInfo } from '@cognite/sdk-react-query-hooks';
import PlotlyChart from 'components/PlotlyChart/PlotlyChart';
import dayjs from 'dayjs';
import {
  useDeleteChart,
  useMyCharts,
  useUpdateChart,
} from 'hooks/charts-storage';
import { filter, orderBy } from 'lodash';
import { availableWorkflows } from 'models/calculation-results/selectors';
import { Chart } from 'models/chart/types';
import { duplicate } from 'models/chart/updates';
import { ComponentProps, useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import fetchPlotlyPropsPreview from '../../utils/plotlyChart/fetchPlotlyPropsPreview';

type ChartItem = {
  id: string;
  name: string;
  owner: string;
  /** Date in ISO format */
  updatedAt: string;
  /** Firebase Chart mainly for chart duplciation */
  firebaseChart: Chart;
  plotlyProps: ComponentProps<typeof PlotlyChart>;
};

type ChartList = {
  loading: boolean;
  error: string | boolean;
  orderBy: string;
  searchTerm: string;
  charts: ChartItem[];
};

const useMyChartsList = () => {
  const { data: login } = useUserInfo();
  const [myChartList, setMyChartList] = useState<ChartList>({
    loading: true,
    error: false,
    orderBy: 'updatedAt',
    searchTerm: '',
    charts: [],
  });
  const sdk = useSDK();
  const {
    data: firebaseMyCharts,
    isFetched: isMyChartsReady,
    error: errorMyCharts,
  } = useMyCharts();
  const { mutateAsync: deleteChartInFirebase } = useDeleteChart();
  const { mutateAsync: createChartInFirebase } = useUpdateChart();
  const localWorkflows = useRecoilValue(availableWorkflows);

  useEffect(() => {
    setMyChartList((prev) => ({
      ...prev,
      error: typeof errorMyCharts === 'string' ? errorMyCharts : false,
    }));
  }, [errorMyCharts]);

  const convertedModel = useCallback(
    async (chart: Chart) => ({
      id: chart.id,
      name: chart.name,
      owner: chart.userInfo?.displayName ?? '',
      updatedAt: dayjs(chart.updatedAt).toISOString(),
      firebaseChart: chart,
      plotlyProps: await fetchPlotlyPropsPreview(chart, sdk, localWorkflows),
    }),
    [localWorkflows, sdk]
  );

  useEffect(() => {
    (async () => {
      setMyChartList((prev) => ({ ...prev, loading: true }));
      if (isMyChartsReady && !errorMyCharts && firebaseMyCharts) {
        const convertedCharts = await Promise.all(
          firebaseMyCharts.map(convertedModel)
        );
        setMyChartList((prev) => {
          return { ...prev, charts: convertedCharts };
        });
      }
      setMyChartList((prev) => ({ ...prev, loading: !isMyChartsReady }));
    })();
  }, [convertedModel, errorMyCharts, firebaseMyCharts, isMyChartsReady]);

  const sortList = (property: 'updatedAt' | 'name' | 'owner' = 'updatedAt') => {
    setMyChartList((prev) => ({
      ...prev,
      orderBy: property,
    }));
  };

  const filterList = (searchTerm: string) => {
    setMyChartList((prev) => {
      return { ...prev, searchTerm };
    });
  };

  const deleteChart = (chartId: string) => {
    setMyChartList((prev) => ({ ...prev, loading: true }));
    deleteChartInFirebase(chartId);
  };

  const duplicateChart = async (chartId: string) => {
    const chartToDuplicate = myChartList.charts.find(
      (chart) => chart.id === chartId
    );
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
  const filteredList = myChartList.searchTerm
    ? filter(myChartList.charts, ({ name, owner, updatedAt }) =>
        [name, owner, updatedAt].some((field) =>
          field
            .toLocaleLowerCase()
            .includes(myChartList.searchTerm.toLocaleLowerCase())
        )
      )
    : myChartList.charts;

  /**
   * Derive ordered (and filtered) list
   */
  const orderedList = orderBy(filteredList, [myChartList.orderBy], ['desc']);

  return {
    list: orderedList,
    sortList,
    filterList,
    deleteChart,
    duplicateChart,
    duplicatePublicChart,
    loading: myChartList.loading,
    error: myChartList.error,
  };
};

export default useMyChartsList;
