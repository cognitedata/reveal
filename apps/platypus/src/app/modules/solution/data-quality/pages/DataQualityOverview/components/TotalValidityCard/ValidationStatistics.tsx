import { Body, Divider, Flex, Heading, Tooltip } from '@cognite/cogs.js';

import { LastValidationTime, ValidationDifference } from '..';
import { Spinner } from '../../../../../../../components/Spinner/Spinner';
import { useTranslation } from '../../../../../../../hooks/useTranslation';
import { useLoadDatapoints, useLoadRules } from '../../../../hooks';
import { abbreviateNumber } from '../../../../utils/numbers';
import {
  TimeSeriesType,
  getDatapointsById,
  getLastDatapointValue,
  getScoreValue,
  getTimeSeriesId,
} from '../../../../utils/validationTimeseries';

type ValidationStatisticsProps = {
  dataSourceId: string;
};

export const ValidationStatistics = ({
  dataSourceId,
}: ValidationStatisticsProps) => {
  const { t } = useTranslation('ValidationStatistics');

  const { rules } = useLoadRules();
  const { datapoints, isLoading: loadingDatapoints } = useLoadDatapoints({
    target: 'dataSource',
    rules,
  });

  const timeSeriesIdScore = getTimeSeriesId(TimeSeriesType.SCORE, dataSourceId);
  const timeSeriesIdInstances = getTimeSeriesId(
    TimeSeriesType.TOTAL_ITEMS_COUNT,
    dataSourceId
  );
  const scoreDatapointValue = getLastDatapointValue(
    datapoints,
    timeSeriesIdScore
  );
  const scoreValue = getScoreValue(scoreDatapointValue) || '-';
  const totalInstancesValue =
    getLastDatapointValue(datapoints, timeSeriesIdInstances) || 0;

  const rulesCount = rules.length;
  const rulesText = t('data_quality_rule', 'rule', {
    count: rulesCount,
  }).toLowerCase();

  const scoreDatapoints = getDatapointsById(datapoints, timeSeriesIdScore);
  const totalInstancesDatapoints = getDatapointsById(
    datapoints,
    timeSeriesIdInstances
  );

  if (loadingDatapoints)
    return (
      <div>
        <Spinner size={14} />
      </div>
    );

  return (
    <Flex
      direction="row"
      gap={16}
      justifyContent="space-between"
      style={{ width: '95%' }}
    >
      <Flex direction="column" gap={4}>
        <Flex alignItems="center" direction="row" gap={8}>
          <Heading>{scoreValue}</Heading>
          <ValidationDifference tsDatapoints={scoreDatapoints} showStaleState />
        </Flex>
        <LastValidationTime
          datapoints={datapoints}
          displayType="muted"
          loading={loadingDatapoints}
        />
      </Flex>

      <div>
        <Divider direction="vertical" />
      </div>

      <Flex direction="column" gap={4}>
        <Flex alignItems="center" direction="row" gap={8}>
          <Tooltip
            content={`${totalInstancesValue.toLocaleString()} ${t(
              'data_quality_items_checked',
              'items checked'
            )}`}
          >
            <Heading>{abbreviateNumber(totalInstancesValue)}</Heading>
          </Tooltip>
          <Body size="x-small">
            {t('data_quality_items_checked', 'items checked')}
          </Body>
          <ValidationDifference tsDatapoints={totalInstancesDatapoints} />
        </Flex>

        <Flex alignItems="center" direction="row" gap={8}>
          <Body size="x-small" muted>
            {`${rulesCount} ${rulesText}`}
          </Body>
        </Flex>
      </Flex>
    </Flex>
  );
};
