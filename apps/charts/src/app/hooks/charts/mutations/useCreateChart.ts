import { useUserInfo } from '@charts-app/hooks/useUserInfo';
import { useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { v4 } from 'uuid';

import { getProject } from '@cognite/cdf-utilities';
import { Chart, createChart } from '@cognite/charts-lib';

const useCreateChart = () => {
  const { data: loginInfo } = useUserInfo();
  const project = getProject();

  return useMutation(async () => {
    if (!loginInfo?.id) throw new Error('No user present!');

    const newChart: Chart = {
      id: v4(),
      user: loginInfo.id,
      userInfo: {
        id: loginInfo.id,
        displayName: loginInfo.displayName,
        email: loginInfo.mail,
      },
      name: 'New chart',
      updatedAt: Date.now(),
      createdAt: Date.now(),
      timeSeriesCollection: [],
      workflowCollection: [],
      thresholdCollection: [],
      scheduledCalculationCollection: [],
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
