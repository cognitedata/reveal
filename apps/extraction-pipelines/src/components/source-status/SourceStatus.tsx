import React, { useMemo, useState } from 'react';

import { Body, Colors, Flex, SegmentedControl, Title } from '@cognite/cogs.js';
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
  formatUptime,
  getUptimeAggregations,
} from 'utils/hostedExtractors';

import { SourceStatusItem } from './SourceStatusItem';

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

  const [aggregations, averageUptime] = useMemo(() => {
    const intervalCount = aggregationInterval === 'hourly' ? 72 : 30;
    const arr = getUptimeAggregations(logs, aggregationInterval, intervalCount);
    const [sum, count] = arr.reduce(
      (acc, cur) =>
        cur.uptimePercentage !== -1
          ? [acc[0] + cur.uptimePercentage, acc[1] + 1]
          : acc,
      [0, 0]
    );
    const average = sum / count;
    return [arr, average];
  }, [aggregationInterval, logs]);

  const [_, setSearchParams] = useSearchParams();

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
      title={
        <Flex direction="column">
          <Title level={6}>{t('topic-filters-status')}</Title>
          <Body muted level={3}>
            {t('uptime-with-percentage', {
              percentage: formatUptime(averageUptime),
            })}
          </Body>
        </Flex>
      }
    >
      <Content>
        <Flex direction="row-reverse" gap={4}>
          {aggregations.map((aggregation) => (
            <SourceStatusItem aggregation={aggregation} />
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
  padding: 0 16px 16px;
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
