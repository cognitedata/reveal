import {
  Body,
  Colors,
  Detail,
  Flex,
  Icon,
  SegmentedControl,
  Title,
} from '@cognite/cogs.js';
import { useTranslation } from 'common';
import Section from 'components/section';
import { MQTTJobWithMetrics } from 'hooks/hostedExtractors';
import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  AggregationInterval,
  getMetricAggregationErrorCount,
  getMetricAggregationSuccessCount,
  getMetricAggregations,
} from 'utils/hostedExtractors';
import { BAR_HEIGHT, MessageHistoryChartItem } from './MessageHistoryChartItem';
import { MessageHistoryChart } from './MessageHistoryChart';
import { DataHistoryChart } from './DataHistoryChart';

type MessageHistoryChartSectionProps = {
  className?: string;
  jobs: MQTTJobWithMetrics[];
};

export const MessageHistoryChartSection = ({
  className,
  jobs,
}: MessageHistoryChartSectionProps): JSX.Element => {
  const { t } = useTranslation();

  const [aggregationInterval, setAggregationInterval] =
    useState<AggregationInterval>('hourly');

  const aggregations = useMemo(() => {
    const metrics = jobs.flatMap(({ metrics }) => metrics);

    return getMetricAggregations(
      metrics,
      aggregationInterval,
      aggregationInterval === 'hourly' ? 72 : 30
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
      extra={
        <SegmentedControl
          controlled
          currentKey={aggregationInterval}
          onButtonClicked={(interval) => {
            setAggregationInterval(interval as AggregationInterval);
          }}
        >
          <SegmentedControl.Button key="hourly">
            {t('hourly')}
          </SegmentedControl.Button>
          <SegmentedControl.Button key="daily">
            {t('daily')}
          </SegmentedControl.Button>
        </SegmentedControl>
      }
      title={<Title level={6}>{t('topic-filters-status')}</Title>}
    >
      <Content>
        <StyledMessageHistoryChart jobs={jobs} />
        <StyledDataHistoryChart jobs={jobs} />
      </Content>
    </Section>
  );
};

const Content = styled.div`
  display: grid;
  gap: 4px;
  grid-template-rows: [start] auto [first] auto [end];
  grid-template-columns: [start] 0px [first] auto [second];
  padding: 0 12px 16px;
  bottom: 0;
`;

const StyledMessageHistoryChart = styled(MessageHistoryChart)`
  grid-column: first / second;
  grid-row: first / end;
  margin-bottom: 0;
  display: flex;
`;

const StyledDataHistoryChart = styled(DataHistoryChart)`
  grid-column: second / end;
  grid-row: first / end;
  margin-bottom: 0;
  display: flex;
`;
