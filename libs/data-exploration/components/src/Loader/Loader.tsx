import React from 'react';

import styled from 'styled-components';

import { Colors } from '@cognite/cogs.js';

import { LoadingIcon } from '../Icons';

export const Loader = () => (
  <Wrapper>
    <LoadingIcon />
  </Wrapper>
);

const Wrapper = styled.div`
  height: 100%;
  width: 100%;
  justify-content: center;
  display: flex;
  align-items: center;
  color: ${Colors['decorative--grayscale--400']};

  svg {
    width: 100%;
    height: 100%;
    width: 36px;
    height: 36px;
  }
`;
