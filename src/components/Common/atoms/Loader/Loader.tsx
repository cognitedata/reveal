import React from 'react';
import styled from 'styled-components';
import { Loader as CogsLoader } from '@cognite/cogs.js';

export const Loader = () => {
  return (
    <Wrapper>
      <CogsLoader darkMode={false} />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  height: 100%;
  width: 100%;
  justify-content: center;
  display: flex;
  align-items: center;
`;
