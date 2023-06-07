import React from 'react';
import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';

type Props = {
  value: string | number;
  color?: string;
  backgroundColor?: string;
};
export const CountLabel = (props: Props) => {
  const {
    value,
    color = 'white',
    backgroundColor = Colors.midblue.hex(),
  } = props;
  return (
    <StyledLabel color={color} backgroundColor={backgroundColor}>
      {value}
    </StyledLabel>
  );
};

const StyledLabel = styled.span<{ backgroundColor: string; color: string }>`
  padding: 2px 12px;
  border-radius: 50px;
  background-color: ${({ backgroundColor }) => backgroundColor};
  color: ${({ color }) => color};
  font-size: 12px;
  font-weight: 800;
`;
