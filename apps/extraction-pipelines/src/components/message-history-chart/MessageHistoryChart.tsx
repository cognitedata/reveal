import React, { useMemo } from 'react';

import styled from 'styled-components';

import { Body, Colors, Detail, Flex, Icon, Title } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import { MQTTJobWithMetrics } from '../../hooks/hostedExtractors';
import {
  getMetricAggregationErrorCount,
  getMetricAggregationSuccessCount,
  getMetricAggregations,
} from '../../utils/hostedExtractors';
import Section from '../section';

import { BAR_HEIGHT, MessageHistoryChartItem } from './MessageHistoryChartItem';

type MessageHistoryChartProps = {
  className?: string;
  jobs: MQTTJobWithMetrics[];
  aggregationInterval: 'hourly' | 'daily';
};

export const MessageHistoryChart = ({
  className,
  jobs,
  aggregationInterval,
}: MessageHistoryChartProps): JSX.Element => {
  const { t } = useTranslation();

  const aggregations = useMemo(() => {
    const metrics = jobs.flatMap(({ metrics: m }) => m);

    return getMetricAggregations(
      metrics,
      aggregationInterval,
      aggregationInterval === 'hourly' ? 24 : 30
    );
  }, [jobs, aggregationInterval]);

  const yMax = Math.max(
    ...aggregations.map(({ data }) => {
      if (!data) {
        return 0;
      }

      const successCount = getMetricAggregationSuccessCount(data);
      const errorCount = getMetricAggregationErrorCount(data);
      return successCount + errorCount;
    })
  );

  const totalErrorCount = useMemo(() => {
    return aggregations.reduce((acc, cur) => {
      return acc + getMetricAggregationErrorCount(cur.data);
    }, 0);
  }, [aggregations]);

  return (
    <Section
      borderless
      className={className}
      title={
        <Flex direction="column" gap={2}>
          <Title level={6}>{t('messages-from-topic-filters')}</Title>
          <Flex alignItems="center" gap={4}>
            <Icon
              type={totalErrorCount === 0 ? 'CheckmarkFilled' : 'ErrorFilled'}
              css={{
                color:
                  totalErrorCount === 0
                    ? Colors['text-icon--status-success']
                    : Colors['text-icon--status-critical'],
              }}
            />
            <Body level={3} muted>
              {t('message-transform-error-count', { count: totalErrorCount })}
            </Body>
          </Flex>
        </Flex>
      }
    >
      <Content>
        <YAxis>
          <Detail muted>
            {new Intl.NumberFormat(undefined, { notation: 'compact' }).format(
              yMax
            )}
          </Detail>
          <Detail muted>0</Detail>
        </YAxis>
        <XAxis>
          <Detail muted>
            {aggregationInterval === 'daily'
              ? t('thirthy-days-ago')
              : t('seventy-two-hours-ago')}
          </Detail>
          <Detail muted>{t('now')}</Detail>
        </XAxis>
        <ChartContent>
          {aggregations.map((aggregation) => (
            <MessageHistoryChartItem
              key={aggregation.startTime}
              aggregation={aggregation}
              yMax={yMax}
            />
          ))}
        </ChartContent>
      </Content>
    </Section>
  );
};

const Content = styled.div`
  display: grid;
  gap: 4px;
  grid-template-rows: [start] ${BAR_HEIGHT + 5}px [first] auto [end];
  grid-template-columns: [start] 30px [first] auto [second];
  padding: 0 12px 16px;
`;

const XAxis = styled.div`
  display: flex;
  justify-content: space-between;
  grid-row: first / end;
  grid-column: first / end;
  padding: 0 8px;
  width: 100%;
`;

const YAxis = styled.div`
  grid-row: start / first;
  grid-column: start / first;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  margin: -6px 0;
  width: 30px;
`;

const ChartContent = styled.div`
  border-bottom: 1px solid ${Colors['border--status-undefined--muted']};
  border-left: 2px dashed ${Colors['border--status-undefined--muted']};
  display: flex;
  flex-direction: row-reverse;
  gap: 4px;
  grid-row: start / first;
  grid-column: first / end;
  padding: 0 12px 4px;
`;
