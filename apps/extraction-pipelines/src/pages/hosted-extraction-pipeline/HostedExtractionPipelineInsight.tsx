import React from 'react';

import styled from 'styled-components';

import { Box } from 'components/box/Box';
import { MQTTSourceWithJobMetrics } from 'hooks/hostedExtractors';
import { Illustrations } from '@cognite/cogs.js';

type HostedExtractionPipelineInsightProps = {
  source: MQTTSourceWithJobMetrics;
};

export const HostedExtractionPipelineInsight =
  ({}: HostedExtractionPipelineInsightProps): JSX.Element => {
    return (
      <TemporaryBox>
        <Illustrations.Solo type="MaintenanceFixTools" />
      </TemporaryBox>
    );
  };

const TemporaryBox = styled(Box)`
  align-items: center;
  display: flex;
  height: 256px;
  justify-content: center;
  width: 1024px;
`;
