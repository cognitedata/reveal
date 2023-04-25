import React from 'react';

import { MQTTSourceWithJobMetrics } from 'hooks/hostedExtractors';

type HostedExtractionPipelineInsightProps = {
  source: MQTTSourceWithJobMetrics;
};

export const HostedExtractionPipelineInsight =
  ({}: HostedExtractionPipelineInsightProps): JSX.Element => {
    return <div>HostedExtractionPipelineInsight</div>;
  };
