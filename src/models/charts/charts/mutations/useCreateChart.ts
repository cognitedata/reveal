import { useUserInfo } from '@cognite/sdk-react-query-hooks';
import dayjs from 'dayjs';
import { useProject } from 'hooks/config';
import { Chart } from 'models/charts/charts/types/types';
import { useMutation } from 'react-query';
import { createChart } from 'services/charts-storage';
import { v4 } from 'uuid';

const useCreateChart = () => {
  const { data: loginInfo } = useUserInfo();
  const project = useProject();

  return useMutation(async () => {
    if (!loginInfo?.id) throw new Error('No user present!');

    const newChart: Chart = {
      id: v4(),
      user: loginInfo.id,
      userInfo: loginInfo,
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
    await createChart(project, newChart.id, newChart);
    return newChart.id;
  });
};

export default useCreateChart;
