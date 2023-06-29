import React, { useState } from 'react';

import styled from 'styled-components';

import { SegmentedControl, Title } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import Section from '../../components/section';
import { MQTTJobWithMetrics } from '../../hooks/hostedExtractors';
import { AggregationInterval } from '../../utils/hostedExtractors';

import { DataHistoryChart } from './DataHistoryChart';
import { MessageHistoryChart } from './MessageHistoryChart';

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
        <StyledMessageHistoryChart
          jobs={jobs}
          aggregationInterval={aggregationInterval}
        />
        <StyledDataHistoryChart
          jobs={jobs}
          aggregationInterval={aggregationInterval}
        />
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
  box-shadow: none;
`;

const StyledDataHistoryChart = styled(DataHistoryChart)`
  grid-column: second / end;
  grid-row: first / end;
  margin-bottom: 0;
  display: flex;
  box-shadow: none;
`;
