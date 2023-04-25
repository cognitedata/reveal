import React from 'react';

import styled from 'styled-components';

import { ReadMQTTSource } from 'hooks/hostedExtractors';
import { SummaryBox } from 'components/summary-box/SummaryBox';
import { useTranslation } from 'common';
import { Box } from 'components/box/Box';

const PAGE_WIDTH = 1024;

type HostedExtractionPipelineOverviewProps = {
  source: ReadMQTTSource;
};

export const HostedExtractionPipelineOverview =
  ({}: HostedExtractionPipelineOverviewProps): JSX.Element => {
    const { t } = useTranslation();

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
          content={t('error', { count: 0 })} // FIXME: use real data
          icon="InputData"
          title={t('errors-in-the-last-30-days')}
        />
        <TopicFilters>test</TopicFilters>
      </OverviewGrid>
    );
  };

const OverviewGrid = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: [start] 1fr [first] 1fr [second] 1fr [end];
  grid-template-rows: [start] 72px [first] 200px [second] 200px [end];
  width: ${PAGE_WIDTH}px;
`;

const HostedExtractionPipelineSummaryBox = styled(SummaryBox)`
  grid-column: span 1;
  grid-row: span 1;
`;

const TopicFilters = styled(Box)`
  grid-column: start / second;
  grid-row: second / end;
`;
