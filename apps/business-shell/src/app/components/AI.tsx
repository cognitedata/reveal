import styled from 'styled-components';

import { Copilot } from '@fusion/copilot-core';

import { useSDK } from '@cognite/sdk-provider';

import zIndex from '../../utils/zIndex';

export const AI = () => {
  const sdk = useSDK();

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
