import React from 'react';

import styled from 'styled-components';

import { JobsTable } from 'components/jobs-table/JobsTable';
import { MQTTSourceWithJobMetrics } from 'hooks/hostedExtractors';
import { PAGE_WIDTH } from 'utils/constants';

type HostedExtractionPipelineInsightProps = {
  source: MQTTSourceWithJobMetrics;
};

export const HostedExtractionPipelineInsight = ({
  source,
}: HostedExtractionPipelineInsightProps): JSX.Element => {
  return (
    <InsightGrid>
      <JobsTableSection jobs={source.jobs} />
    </InsightGrid>
  );
};

const InsightGrid = styled.div`
  display: grid;
  gap: 16px;
  grid-template-rows: [start] 72px [first] auto [end];
  width: ${PAGE_WIDTH}px;
`;

const JobsTableSection = styled(JobsTable)`
  grid-row: start / end;
`;
