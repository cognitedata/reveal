import {
  TimeSeriesType,
  formatDateDatum,
  getDatapointsById,
  getScore,
  getTimeSeriesId,
} from '@data-quality/utils/validationTimeseries';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { Flex } from '@cognite/cogs.js';
import { LineChart, Data, HoverLineData } from '@cognite/plotting-components';
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

  const dataScore = {
    x: scoreDatapoints?.datapoints?.map((dp) => dp.timestamp) ?? [],
    y: scoreDatapoints?.datapoints?.map((dp) => getScore(dp.value)) ?? [],
    color: 'purple',
    name: t('data_quality_total_validity_score', 'Total validity score'),
  } as Data;
  const dataInstances = {
    x: totalInstancesDatapoints?.datapoints?.map((dp) => dp.timestamp) ?? [],
    y: totalInstancesDatapoints?.datapoints?.map((dp) => dp.value) ?? [],
    color: 'blue',
    name: t('data_quality_total_items_checked', 'Total of items checked'),
  } as Data;

  const formatScoreDot = ({ x, y }: HoverLineData) =>
    `${formatDateDatum(x)}, score = ${y}%`;

  const formatInstancesDot = ({ x, y }: HoverLineData) =>
    `${formatDateDatum(x)}, instances = ${y}`;

  return (
    <Flex direction="row" gap={8}>
      <LineChart
        data={dataScore}
        formatHoverLineInfo={formatScoreDot}
        layout={{ showActions: false, showTooltip: false }}
        style={{ backgroundColor: 'white', height: 250, width: 400 }}
      />
      <LineChart
        data={dataInstances}
        formatHoverLineInfo={formatInstancesDot}
        layout={{ showActions: false, showTooltip: false }}
        style={{ backgroundColor: 'white', height: 250, width: 400 }}
      />
    </Flex>
  );
};
