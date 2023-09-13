import {
  chartConfig,
  formatInstancesDot,
  formatScoreDot,
  getScoreChartData,
  getTotalItemsChartData,
} from '@data-quality/utils/charts';
import {
  TimeSeriesType,
  getDatapointsById,
  getTimeSeriesId,
} from '@data-quality/utils/validationTimeseries';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { Flex } from '@cognite/cogs.js';
import { LineChart } from '@cognite/plotting-components';
import { Datapoints } from '@cognite/sdk/dist/src';

type ValidationGraphProps = {
  dataSourceId: string;
  dsTimeseries: Datapoints[];
};

export const ValidationGraph = ({
  dataSourceId,
  dsTimeseries,
}: ValidationGraphProps) => {
  const { t } = useTranslation('ValidationGraph');

  const timeSeriesIdScore = getTimeSeriesId(TimeSeriesType.SCORE, dataSourceId);
  const timeSeriesIdInstances = getTimeSeriesId(
    TimeSeriesType.TOTAL_ITEMS_COUNT,
    dataSourceId
  );

  const scoreDatapoints = getDatapointsById(dsTimeseries, timeSeriesIdScore);
  const totalInstancesDatapoints = getDatapointsById(
    dsTimeseries,
    timeSeriesIdInstances
  );

  const dataScore = getScoreChartData(
    scoreDatapoints,
    t('data_quality_total_validity_score', 'Total validity score')
  );
  const dataInstances = getTotalItemsChartData(
    totalInstancesDatapoints,
    t('data_quality_total_items_checked', 'Total of items checked')
  );

  return (
    <Flex direction="row" gap={8}>
      <LineChart
        config={chartConfig}
        data={dataScore}
        formatHoverLineInfo={formatScoreDot}
        layout={{ showActions: false, showTooltip: false }}
        style={{ backgroundColor: 'white', height: 250, width: 400 }}
      />
      <LineChart
        config={chartConfig}
        data={dataInstances}
        formatHoverLineInfo={formatInstancesDot}
        layout={{ showActions: false, showTooltip: false }}
        style={{ backgroundColor: 'white', height: 250, width: 400 }}
      />
    </Flex>
  );
};
