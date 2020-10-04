import React from 'react';
import styled from 'styled-components';
import { Colors, Icon } from '@cognite/cogs.js';

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
  color: ${Colors['greyscale-grey4'].hex()};

  svg {
    width: 100%;
    height: 100%;
    width: 36px;
    height: 36px;
  }
`;
