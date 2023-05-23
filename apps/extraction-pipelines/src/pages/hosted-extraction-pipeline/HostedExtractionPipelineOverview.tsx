import React from 'react';

import styled from 'styled-components';

import { SummaryBox } from 'components/summary-box/SummaryBox';
import { useTranslation } from 'common';
import { TopicFilters } from 'components/topic-filters/TopicFilters';
import { SourceDetails } from 'components/source-details/SourceDetails';
import { SourceAuthentication } from 'components/source-authentication/SourceAuthentication';
import { SourceStatus } from 'components/source-status/SourceStatus';
import {
  MQTTSourceWithJobMetrics,
  useMQTTJobLogs,
} from 'hooks/hostedExtractors';
import { getErrorCountInLast30Days } from 'utils/hostedExtractors';

const PAGE_WIDTH = 1024;

type HostedExtractionPipelineOverviewProps = {
  source: MQTTSourceWithJobMetrics;
};

export const HostedExtractionPipelineOverview = ({
  source,
}: HostedExtractionPipelineOverviewProps): JSX.Element => {
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
        icon="InputData"
        title={t('scheduled-to-run')}
      />
      <HostedExtractionPipelineSummaryBox
        content={t('error', { count: errorCountInLast30Days })}
        icon="InputData"
        title={t('errors-in-the-last-30-days')}
      />
      <TopicFiltersSection source={source} />
      <SourceDetailsSection source={source} />
      <SourceAuthenticationSection source={source} />
      <SourceStatusSection source={source} />
    </OverviewGrid>
  );
};

const OverviewGrid = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: [start] 1fr [first] 1fr [second] 1fr [end];
  grid-template-rows: [start] 72px [first] auto [second] auto [third] auto [end];
  width: ${PAGE_WIDTH}px;
`;

const HostedExtractionPipelineSummaryBox = styled(SummaryBox)`
  grid-column: span 1;
  grid-row: span 1;
`;

const TopicFiltersSection = styled(TopicFilters)`
  grid-column: start / second;
  grid-row: second / end;
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
