import { useMutation } from '@tanstack/react-query';
import { useCdfUserHistoryService } from '@user-history';
import dayjs from 'dayjs';
import { v4 } from 'uuid';

import { UserInfo } from '@cognite/cdf-sdk-singleton';
import { Chart, createChart } from '@cognite/charts-lib';

import { createInternalLink } from '../../../utils/link';

type Props = {
  loginInfo: UserInfo | undefined;
  project: string;
};

const NEW_CHART_NAME = 'New chart';

const useCreateChart = ({ loginInfo, project }: Props) => {
  const userHistoryService = useCdfUserHistoryService();

  return useMutation(
    async () => {
      if (!loginInfo?.id) throw new Error('No user present!');

      const newChart: Chart = {
        id: v4(),
        user: loginInfo.id,
        userInfo: {
          id: loginInfo.id,
          displayName: loginInfo.displayName,
          email: loginInfo.mail,
        },
        name: NEW_CHART_NAME,
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
    },
    {
      onSuccess: (id) => {
        /**
         * Log new resource edit to user history service
         */
        userHistoryService.logNewResourceEdit({
          application: 'charts',
          name: NEW_CHART_NAME,
          path: createInternalLink(id),
        });
      },
    }
  );
};

export default useCreateChart;
