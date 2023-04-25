import React from 'react';

import { ReadMQTTSource } from 'hooks/hostedExtractors';

type HostedExtractionPipelineInsightProps = {
  source: ReadMQTTSource;
};

export const HostedExtractionPipelineInsight =
  ({}: HostedExtractionPipelineInsightProps): JSX.Element => {
    return <div>HostedExtractionPipelineInsight</div>;
  };
