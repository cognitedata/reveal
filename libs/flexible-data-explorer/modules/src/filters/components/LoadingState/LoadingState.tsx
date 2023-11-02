import * as React from 'react';

import styled from 'styled-components/macro';

import { Icon } from '@cognite/cogs.js';

export const LoadingState: React.FC = () => {
  return (
    <Wrapper>
      <Icon type="Loader" size={24} />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100px;
  justify-content: center;
  align-items: center;
  color: var(--cogs-text-icon--muted);
`;
