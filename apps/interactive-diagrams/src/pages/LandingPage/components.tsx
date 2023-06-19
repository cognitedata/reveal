import React from 'react';

import styled from 'styled-components';

import { Colors } from '@cognite/cogs.js';

import { Flex, Loader } from '../../components/Common';

export const Loading = () => (
  <Flex style={{ height: '50vh' }}>
    <Loader />
  </Flex>
);

export const TitleRow = styled(Flex)`
  justify-content: space-between;
  padding-bottom: 32px;
  border-bottom: 1px solid ${Colors['decorative--grayscale--400']};
  margin-bottom: 20px;
`;
