/* eslint-disable no-nested-ternary */

import styled from 'styled-components';

import { Colors, Flex, Icon } from '@cognite/cogs.js';

export const Column = styled(Flex).attrs({ direction: 'column' })<{
  $border?: boolean;
}>`
  padding: 8px 8px 8px 0;
  overflow: auto;
  border-right: ${(props) =>
    props.$border ? `1px solid ${Colors['border--muted']}` : 'initial'};
  margin-right: ${(props) => (props.$border ? '8px' : 'initial')};
`;

export const ColumnContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  height: 500px;
`;

export const Label = styled(Flex).attrs({
  justifyContent: 'space-between',
  alignItems: 'center',
})`
  border-radius: 6px;
  padding: 8px;
  color: ${Colors['text-icon--muted']};
  font-weight: 400;
  font-size: 12px;
`;

export const Item = styled(Flex).attrs({
  justifyContent: 'space-between',
  alignItems: 'center',
})<{ $active?: boolean }>`
  border-radius: 6px;
  padding: 8px;
  background-color: ${({ $active }) =>
    $active ? Colors['surface--interactive--toggled-default'] : 'initial'};
  color: ${({ $active }) =>
    $active
      ? Colors['text-icon--interactive--default']
      : Colors['text-icon--medium']};

  &:hover {
    background-color: ${({ $active }) =>
      $active
        ? Colors['surface--interactive--toggled-default']
        : Colors['surface--interactive--hover']};
    color: ${({ $active }) =>
      $active
        ? Colors['text-icon--interactive--pressed']
        : Colors['text-icon--strong']};
    cursor: pointer;
  }
`;

export const CenteredColumnContent = styled(Flex).attrs({
  justifyContent: 'center',
  alignItems: 'center',
  direction: 'column',
})`
  flex-grow: 1;
`;

export const RotatedIcon = styled(Icon)<{ $deg: number }>`
  transform: ${({ $deg }) => `rotate(${$deg}deg)`};
`;
