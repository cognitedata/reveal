import React from 'react';

import styled from 'styled-components';

import { Colors } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import { SourceAuthentication } from '../../components/source-authentication/SourceAuthentication';
import { SourceDetails } from '../../components/source-details/SourceDetails';
import { SourceStatus } from '../../components/source-status/SourceStatus';
import { SummaryBox } from '../../components/summary-box/SummaryBox';
import { TopicFilters } from '../../components/topic-filters/TopicFilters';
import {
  MQTTSourceWithJobMetrics,
  useMQTTJobLogs,
} from '../../hooks/hostedExtractors';
import { PAGE_WIDTH } from '../../utils/constants';
import { getErrorCountInLast30Days } from '../../utils/hostedExtractors';

type HostedExtractionPipelineOverviewProps = {
  source: MQTTSourceWithJobMetrics;
};

export const HostedExtractionPipelineOverviewNew = ({
  source,
}: HostedExtractionPipelineOverviewProps): React.JSX.Element => {
  const { t } = useTranslation();

  const { data: logs } = useMQTTJobLogs(source.externalId);

  const errorCountInLast30Days = getErrorCountInLast30Days(logs);

  return (
    <OverviewGrid>
      <HostedExtractionPipelineSummaryBox
        content={t('hosted-mqtt-extractor')}
        icon="InputData"
        title={t('extractor-type')}
      />
      <HostedExtractionPipelineSummaryBox
        content={t('continuously')}
        icon="Calendar"
        title={t('scheduled-to-run')}
      />
      <HostedExtractionPipelineSummaryBox
        content={t('error', { count: errorCountInLast30Days })}
        icon="Error"
        title={t('errors-in-the-last-30-days')}
      />
      <TopicFiltersSection source={source} $rowStart={source.jobs.length} />
      <SourceDetailsSection source={source} />
      <SourceAuthenticationSection source={source} />
      {source.jobs.length > 0 && <SourceStatusSection source={source} />}
    </OverviewGrid>
  );
};

const HostedExtractionPipelineSummaryBox = styled(SummaryBox)`
  min-width: 178px;
  padding: 24px;
  background: ${Colors['surface--muted']};
  border-radius: 8px;
  border: 1px solid #e6e6e6;
`;

const OverviewGrid = styled.div`
  width: ${PAGE_WIDTH}px;
  display: grid;
  gap: 16px;
  grid-template-columns: [start] 1fr [first] 1fr [second] 1fr [end];
  grid-template-rows: [start] 88px [first] auto [second] auto [third] auto [end];
`;

const TopicFiltersSection = styled(TopicFilters)<{ $rowStart: number }>`
  grid-column: start / second;
  grid-row: ${({ $rowStart }) => ($rowStart === 0 ? 'first' : 'second')} / end;

  margin-bottom: 0;
`;

const SourceDetailsSection = styled(SourceDetails)`
  grid-column: second / end;
  grid-row: first / third;
  margin-bottom: 0;
`;

const SourceAuthenticationSection = styled(SourceAuthentication)`
  grid-column: second / end;
  grid-row: third / end;
  margin-bottom: 0;
`;

const SourceStatusSection = styled(SourceStatus)`
  grid-column: start / second;
  grid-row: first / second;
  margin-bottom: 0;
`;
