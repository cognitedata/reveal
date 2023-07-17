import { useDataSourceValidity, useLoadRules } from '@data-quality/hooks';
import {
  TimeSeriesType,
  getLastDatapointValue,
  getScoreValue,
  getTimeSeriesId,
} from '@data-quality/utils/validationTimeseries';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { Body, Detail, Divider, Flex, Title } from '@cognite/cogs.js';

import { LastValidationTime } from '..';

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

  return (
    <Flex direction="row" gap={16} justifyContent="space-between">
      <Flex direction="row">
        <Title>{scoreValue}</Title>
        {/* Add here the difference between runs */}
      </Flex>

      <div>
        <Divider direction="vertical" />
      </div>

      <Flex direction="column" gap={4}>
        <Flex direction="row" gap={8} alignItems="center">
          <Title>{rulesCount}</Title>
          <Detail>{rulesText}</Detail>
        </Flex>
        <Flex direction="column">
          <Body level={6}>{`${totalInstancesValue.toLocaleString()} ${t(
            'data_quality_data_checks',
            'data_checks'
          )}`}</Body>
          <LastValidationTime
            datapoints={datapoints}
            displayType="muted"
            loading={loadingDatapoints}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};
