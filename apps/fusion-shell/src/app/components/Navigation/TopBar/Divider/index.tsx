import React from 'react';

import styled from 'styled-components';

import { Colors } from '@cognite/cogs.js';

const DEFAULT_DIVIDER_MARGIN_IN_PX = 8;

type DividerProps = {
  left?: number;
  right?: number;
};

const Divider = ({
  left = DEFAULT_DIVIDER_MARGIN_IN_PX,
  right = DEFAULT_DIVIDER_MARGIN_IN_PX,
}: DividerProps): JSX.Element => {
  return <StyledDivider $left={left} $right={right} />;
};

const StyledDivider = styled.div<{ $left: number; $right: number }>`
  background-color: ${Colors['border--muted--inverted']};
  height: 20px;
  margin-left: ${({ $left }) => $left}px;
  margin-right: ${({ $right }) => $right}px;
  width: 1px;
`;

export default Divider;
