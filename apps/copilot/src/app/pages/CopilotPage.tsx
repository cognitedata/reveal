import { CogniteChainName, Copilot } from '@fusion/copilot-core';

import sdk from '@cognite/cdf-sdk-singleton';

const excludeChains: CogniteChainName[] = [
  'WorkorderChain',
  'DocumentQueryChain',
  'DocumentSummaryChain',
  'FusionQAChain',
];

export const CopilotPage = () => {
  return <Copilot sdk={sdk} excludeChains={excludeChains} />;
};
