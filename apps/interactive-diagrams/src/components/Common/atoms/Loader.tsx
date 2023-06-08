import React from 'react';
import styled from 'styled-components';
import { Icon } from '@cognite/cogs.js';

export const Loader = () => {
  return (
    <Wrapper>
      <Icon type="Loader" />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  height: 100%;
  width: 100%;
  justify-content: center;
  display: flex;
  align-items: center;

  svg {
    width: 56px;
    height: 56px;
  }
`;
