import { useUserInfo } from '@cognite/sdk-react-query-hooks';
import dayjs from 'dayjs';
import { useUpdateChart } from 'hooks/charts-storage';
import { Chart } from 'models/chart/types';
import { v4 } from 'uuid';

const useFirebaseCreateNewChart = () => {
  const { data: login } = useUserInfo();
  const { mutateAsync: updateChartInFirebase } = useUpdateChart();
  const createNewChart = async () => {
    if (!login?.id) return '';

    const newChart: Chart = {
      id: v4(),
      user: login?.id,
      userInfo: login,
      name: 'New chart',
      updatedAt: Date.now(),
      createdAt: Date.now(),
      timeSeriesCollection: [],
      workflowCollection: [],
      thresholdCollection: [],
      dateFrom: dayjs()
        .subtract(30, 'days')
        .set('hour', 0)
        .set('minute', 0)
        .set('second', 0)
        .set('millisecond', 0)
        .toISOString(),
      dateTo: dayjs()
        .set('hour', 23)
        .set('minute', 59)
        .set('second', 59)
        .set('millisecond', 999)
        .toISOString(),
      public: false,
      version: 1,
      settings: {
        showYAxis: true,
        showMinMax: false,
        showGridlines: true,
        mergeUnits: false,
      },
    };
    return updateChartInFirebase(newChart);
  };
  return { createNewChart };
};

export default useFirebaseCreateNewChart;
