import { CogniteChainName, Copilot } from '@fusion/copilot-core';

import sdk from '@cognite/cdf-sdk-singleton';
import { useFlag } from '@cognite/react-feature-flags';

const excludeChains: CogniteChainName[] = [
  'WorkorderChain',
  'DocumentQueryChain',
  'DocumentSummaryChain',
  'FusionQAChain',
];

export const CopilotPage = () => {
  const { isEnabled } = useFlag('COGNITE_COPILOT');
  return (
    <div style={{ display: isEnabled ? 'inherit' : 'none' }}>
      <Copilot sdk={sdk} excludeChains={excludeChains} />
    </div>
  );
};
