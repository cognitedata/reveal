import React from 'react';
import styled from 'styled-components';
import { Icon, Colors } from '@cognite/cogs.js';

export const Loader = () => {
  return (
    <Wrapper>
      <Icon type="Loading" />
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
    color: ${Colors['greyscale-grey4'].hex()};
    width: 56px;
    height: 56px;
  }
`;
