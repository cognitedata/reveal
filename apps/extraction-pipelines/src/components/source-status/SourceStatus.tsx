import React, { useMemo, useState } from 'react';

import { Body, Colors, Flex, SegmentedControl } from '@cognite/cogs.js';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import Section from 'components/section';
import { useTranslation } from 'common';
import {
  MQTTSourceWithJobMetrics,
  useMQTTJobLogs,
} from 'hooks/hostedExtractors';
import {
  AggregationInterval,
  aggregateLogsInLast30Days,
  aggregateLogsInLast72Hours,
} from 'utils/hostedExtractors';

import { SourceStatusDaily } from './SourceStatusDaily';

type SourceStatusProps = {
  className?: string;
  source: MQTTSourceWithJobMetrics;
};

export const SourceStatus = ({
  className,
  source,
}: SourceStatusProps): JSX.Element => {
  const { t } = useTranslation();

  const { data: logs } = useMQTTJobLogs(source.externalId);

  const [aggregationInterval, setAggregationInterval] =
    useState<AggregationInterval>('hourly');

  const aggregations = useMemo(() => {
    return aggregationInterval === 'hourly'
      ? aggregateLogsInLast72Hours(logs)
      : aggregateLogsInLast30Days(logs);
  }, [aggregationInterval, logs]);

  const [_, setSearchParams] = useSearchParams();

  return (
    <Section
      className={className}
      extra={
        <SegmentedControl
          controlled
          currentKey={aggregationInterval}
          onButtonClicked={(interval) => {
            setAggregationInterval(interval as AggregationInterval);
          }}
          size="small"
        >
          <SegmentedControl.Button key="hourly">
            {t('hourly')}
          </SegmentedControl.Button>
          <SegmentedControl.Button key="daily">
            {t('daily')}
          </SegmentedControl.Button>
        </SegmentedControl>
      }
      icon="BarChart"
      title={t('topic-filters-status')}
    >
      <Content>
        <Flex direction="row-reverse" gap={4} style={{ overflow: 'hidden' }}>
          {aggregations.map((aggregation) => (
            <SourceStatusDaily aggregation={aggregation} source={source} />
          ))}
        </Flex>
        <DateAxis>
          <Body level={3} muted>
            {aggregationInterval === 'daily'
              ? t('thirthy-days-ago')
              : t('seventy-two-hours-ago')}
          </Body>
          <Body level={3} muted>
            {t('now')}
          </Body>
          <InsightTabLinkContainer>
            <InsightTabLink
              onClick={() => {
                setSearchParams(
                  (prev) => {
                    prev.set('detailsTab', 'insight');
                    return prev;
                  },
                  { replace: true }
                );
              }}
            >
              <InsightTabLinkContent level={3}>
                {t('view-full-insight')}
              </InsightTabLinkContent>
            </InsightTabLink>
          </InsightTabLinkContainer>
        </DateAxis>
      </Content>
    </Section>
  );
};

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
`;

const DateAxis = styled.div`
  display: flex;
  justify-content: space-between;
  position: relative;
`;

const InsightTabLinkContainer = styled.div`
  left: 50%;
  right: 50%;
  top: 0;
  position: absolute;
  width: max-content;
  transform: translateX(-50%);
`;

const InsightTabLink = styled.button`
  color: ${Colors['text-icon--interactive--default']};
  cursor: pointer;
  background: unset;
  border: none;
  padding: 0;

  :hover {
    color: ${Colors['text-icon--interactive--hover']};
  }

  :active {
    color: ${Colors['text-icon--interactive--pressed']};
  }
`;

const InsightTabLinkContent = styled(Body)`
  color: inherit;
`;
