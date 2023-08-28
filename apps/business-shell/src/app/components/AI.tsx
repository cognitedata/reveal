import styled from 'styled-components';

import { Copilot } from '@fusion/copilot-core';

import { useFlag } from '@cognite/react-feature-flags';
import { useSDK } from '@cognite/sdk-provider';

import zIndex from '../../utils/zIndex';

const AI_FEATURE_FLAG = 'FDX_AI_SEARCH';

export const AI = () => {
  const { isEnabled } = useFlag(AI_FEATURE_FLAG);
  const sdk = useSDK();
  if (!isEnabled) {
    return null;
  }
  return (
    <CopilotWrapper>
      <Copilot sdk={sdk} />
    </CopilotWrapper>
  );
};

const CopilotWrapper = styled.div`
  z-index: ${zIndex.COPILOT};
  position: absolute;
  display: none;
`;
