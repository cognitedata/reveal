import React, { useMemo } from 'react';

import styled from 'styled-components';

import Section from 'components/section';
import { useTranslation } from 'common';
import {
  MQTTSourceWithJobMetrics,
  useMQTTJobLogs,
} from 'hooks/hostedExtractors';
import { aggregateLogsInLast30Days } from 'utils/hostedExtractors';

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

  const dailyAggregations = useMemo(() => {
    return aggregateLogsInLast30Days(logs);
  }, [logs]);

  return (
    <Section
      className={className}
      icon="BarChart"
      title={t('topic-filters-status')}
    >
      <Content>
        {dailyAggregations.map((aggregation) => (
          <SourceStatusDaily aggregation={aggregation} />
        ))}
      </Content>
    </Section>
  );
};

const Content = styled.div`
  display: flex;
  gap: 4px;
  padding: 16px;
`;
