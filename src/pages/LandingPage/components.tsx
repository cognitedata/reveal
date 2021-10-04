import React from 'react';
import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';
import { Flex, Loader } from 'components/Common';

export const Loading = () => (
  <Flex style={{ height: '50vh' }}>
    <Loader />
  </Flex>
);

export const LoadMoreWrapper = styled(Flex)<{ disabled: boolean }>`
  flex-direction: row;
  align-items: center;
  background: ${({ disabled }: { disabled: boolean }) =>
    disabled ? '#F5F5F5' : '#4A67FB'};
  padding: 4px 4px 4px 12px;
  border-radius: 6px;
  justify-content: space-between;

  & > * {
    margin: 0 4px;
  }
`;

export const TitleRow = styled(Flex)`
  justify-content: space-between;
  padding-bottom: 32px;
  border-bottom: 1px solid ${Colors['greyscale-grey4'].hex()};
  margin-bottom: 20px;
`;
