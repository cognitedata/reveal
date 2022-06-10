import { useSDK } from '@cognite/sdk-provider';
import PlotlyChart from 'components/PlotlyChart/PlotlyChart';
import dayjs from 'dayjs';
import { usePublicCharts } from 'hooks/charts-storage';
import { filter, orderBy, uniqBy } from 'lodash';
import { availableWorkflows } from 'models/calculation-results/selectors';
import { Chart } from 'models/chart/types';
import fetchPlotlyPropsPreview from 'utils/plotlyChart/fetchPlotlyPropsPreview';
import { ComponentProps, useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

type ChartItem = {
  id: string;
  name: string;
  owner: string;
  /** Date in ISO format */
  updatedAt: string;
  /** Firebase Chart mainly for chart duplication. */
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

const usePublicChartsList = () => {
  const [publicChartList, setPublicChartList] = useState<ChartList>({
    loading: true,
    error: false,
    orderBy: 'updatedAt',
    searchTerm: '',
    charts: [],
  });
  const sdk = useSDK();
  const {
    data: firebasePublicCharts,
    isFetched: isPublicChartsReady,
    error: errorPublicCharts,
  } = usePublicCharts();
  const localWorkflows = useRecoilValue(availableWorkflows);

  useEffect(() => {
    setPublicChartList((prev) => ({
      ...prev,
      loading: !isPublicChartsReady,
      error: typeof errorPublicCharts === 'string' ? errorPublicCharts : false,
    }));
  }, [isPublicChartsReady, errorPublicCharts]);

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
      if (isPublicChartsReady && !errorPublicCharts && firebasePublicCharts) {
        const convertedCharts = await Promise.all(
          firebasePublicCharts.map(convertedModel)
        );
        setPublicChartList((prev) => {
          // 1. Create List removing duplicates (due to rerendering)
          const charts = uniqBy([...prev.charts, ...convertedCharts], 'id');
          return { ...prev, charts };
        });
      }
    })();
  }, [
    convertedModel,
    errorPublicCharts,
    firebasePublicCharts,
    isPublicChartsReady,
  ]);

  const sortList = (property: 'updatedAt' | 'name' | 'owner' = 'updatedAt') => {
    setPublicChartList((prev) => ({
      ...prev,
      orderBy: property,
    }));
  };

  const filterList = (searchTerm: string) => {
    setPublicChartList((prev) => {
      return { ...prev, searchTerm };
    });
  };

  /**
   * Derive filtered list
   */
  const filteredList = publicChartList.searchTerm
    ? filter(publicChartList.charts, ({ name, owner, updatedAt }) =>
        [name, owner, updatedAt].some((field) =>
          field
            .toLocaleLowerCase()
            .includes(publicChartList.searchTerm.toLocaleLowerCase())
        )
      )
    : publicChartList.charts;

  /**
   * Derive ordered (and filtered) list
   */
  const orderedList = orderBy(
    filteredList,
    [publicChartList.orderBy],
    ['desc']
  );

  return {
    list: orderedList,
    sortList,
    filterList,
    loading: publicChartList.loading,
    error: publicChartList.error,
  };
};

export default usePublicChartsList;
