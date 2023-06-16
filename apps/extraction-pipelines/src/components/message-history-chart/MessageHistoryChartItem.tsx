import { formatTime } from '@cognite/cdf-utilities';
import { Colors, Flex, Icon, Tooltip } from '@cognite/cogs.js';
import { useTranslation } from 'common';
import React from 'react';
import styled from 'styled-components';
import {
  MetricAggregation,
  getMetricAggregationErrorCount,
  getMetricAggregationSuccessCount,
} from 'utils/hostedExtractors';

type MessageHistoryChartItemProps = {
  aggregation: MetricAggregation;
  yMax: number;
};

export const BAR_HEIGHT = 190;
const CATEGORY_GAP = 1;
const CATEGORY_COUNT = 2;
const MIN_BAR_HEIGHT = 4;
const ACTUAL_BAR_HEIGHT =
  BAR_HEIGHT - CATEGORY_GAP * CATEGORY_COUNT - MIN_BAR_HEIGHT * CATEGORY_COUNT;

export const MessageHistoryChartItem = ({
  aggregation,
  yMax,
}: MessageHistoryChartItemProps): JSX.Element => {
  const { t } = useTranslation();

  const successCount = getMetricAggregationSuccessCount(aggregation?.data);
  const successPercentage = successCount / yMax;
  const errorCount = getMetricAggregationErrorCount(aggregation?.data);
  const errorPercentage = errorCount / yMax;

  return (
    <Container>
      <Tooltip
        content={
          <Flex direction="column">
            {successCount === 0 && errorCount === 0 ? (
              t('source-status-no-data')
            ) : (
              <>{formatTime(aggregation.endTime, true)}</>
            )}
            {successCount > 0 && (
              <Flex gap={4}>
                <Icon
                  type="CheckmarkFilled"
                  css={{ color: Colors['text-icon--status-success--inverted'] }}
                />
                {t('message-transform-succeed', { count: successCount })}
              </Flex>
            )}
            {errorCount > 0 && (
              <Flex gap={4}>
                <Icon
                  type="ErrorFilled"
                  css={{
                    color: Colors['text-icon--status-critical--inverted'],
                  }}
                />
                {t('message-transform-failed', { count: errorCount })}
              </Flex>
            )}
          </Flex>
        }
      >
        <>
          {successPercentage > 0 && (
            <SuccessBar
              $height={
                errorPercentage > 0
                  ? successPercentage * ACTUAL_BAR_HEIGHT + MIN_BAR_HEIGHT
                  : successPercentage * BAR_HEIGHT
              }
            />
          )}
          {errorPercentage > 0 && (
            <ErrorBar
              $height={
                successPercentage > 0
                  ? errorPercentage * ACTUAL_BAR_HEIGHT + MIN_BAR_HEIGHT
                  : errorPercentage * BAR_HEIGHT
              }
            />
          )}
          {successPercentage === 0 && errorPercentage === 0 && <NoDataBar />}
        </>
      </Tooltip>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  gap: ${CATEGORY_GAP * CATEGORY_COUNT}px;
  flex-direction: column-reverse;
  flex: 1;
  height: ${BAR_HEIGHT}px;
`;

const BaseBar = styled.div`
  border-radius: 2px;
  height: 0px;
  width: 100%;
`;

const SuccessBar = styled(BaseBar)<{ $height?: number }>`
  height: ${({ $height }) => $height}px;

  background-color: ${Colors['surface--action--strong--default']};

  :hover {
    background-color: ${Colors['surface--action--strong--hover']};
  }
`;

const ErrorBar = styled(BaseBar)<{ $height?: number }>`
  height: ${({ $height }) => $height}px;

  background-color: ${Colors['surface--status-critical--strong--default']};

  :hover {
    background-color: ${Colors['surface--status-critical--strong--hover']};
  }
`;

const NoDataBar = styled(BaseBar)`
  background: ${Colors['surface--medium']};
  border-radius: 2px;
  height: ${BAR_HEIGHT}px;
  opacity: 0.5;

  :hover {
    opacity: 1;
  }
`;
