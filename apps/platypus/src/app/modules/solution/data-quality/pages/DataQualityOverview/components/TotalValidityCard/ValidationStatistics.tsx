import { useDataSourceValidity, useLoadRules } from '@data-quality/hooks';
import { abbreviateNumber } from '@data-quality/utils/numbers';
import {
  TimeSeriesType,
  getDatapointsById,
  getLastDatapointValue,
  getScoreValue,
  getTimeSeriesId,
} from '@data-quality/utils/validationTimeseries';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { Body, Divider, Flex, Heading, Tooltip } from '@cognite/cogs.js';

import { LastValidationTime, ValidationDifference } from '..';

type ValidationStatisticsProps = {
  dataSourceId: string;
};

export const ValidationStatistics = ({
  dataSourceId,
}: ValidationStatisticsProps) => {
  const { t } = useTranslation('ValidationStatistics');

  const { rules } = useLoadRules();
  const { datapoints, loadingDatapoints } = useDataSourceValidity();

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
  const rulesText =
    rules.length === 1
      ? t('data_quality_rule', 'rule')
      : t('data_quality_rules', 'rules');

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
