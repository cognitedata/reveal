import * as React from 'react';

import styled from 'styled-components/macro';

import { Loader } from '@cognite/cogs.js';

// The Loader component has never been made to do this. We need to change it soon

const Wrapper = styled.div`
  transform: translateY(50%);

  & > div {
    position: relative;
  }
`;
export const WhiteLoaderInline: React.FC = () => {
  return (
    <Wrapper>
      <Loader animationDuration={2} width={100} darkMode={false} />
    </Wrapper>
  );
};
