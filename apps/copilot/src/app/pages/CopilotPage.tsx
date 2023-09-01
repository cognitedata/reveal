import { useNavigate } from 'react-router-dom';

import { Copilot } from '@fusion/copilot-core';

import sdk from '@cognite/cdf-sdk-singleton';
import { createLink } from '@cognite/cdf-utilities';
import { CogniteChainName, useFromCopilotEventHandler } from '@cognite/llm-hub';
import { useFlag } from '@cognite/react-feature-flags';

const excludeChains: CogniteChainName[] = [
  'WorkorderChain',
  'DocumentQueryChain',
  'DocumentSummaryChain',
  'FusionQAChain',
  ...(sdk.project === 'cognite2'
    ? []
    : (['DocumentQAQueryChain'] as CogniteChainName[])),
];

export const CopilotPage = () => {
  const navigate = useNavigate();

  useFromCopilotEventHandler('PUSH_DOC_ID_AND_PAGE', (event) => {
    // modify query params to include page and full screen
    const url = createLink(`/explore/search/file`, {
      page: event.page,
      'full-page': true,
      journey: `file-${event.docId}`,
    });

    navigate(url);
  });

  const { isEnabled } = useFlag('COGNITE_COPILOT');
  return (
    <div style={{ display: isEnabled ? 'inherit' : 'none' }}>
      <Copilot sdk={sdk} excludeChains={excludeChains} />
    </div>
  );
};
