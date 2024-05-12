/*!
 * Copyright 2024 Cognite AS
 */
import { ReactElement } from 'react';
import { type RuleOutput } from '../types';
import styled from 'styled-components';

type OutputPanelItemProps = {
  index: number;
  output: RuleOutput;
};

export const OutputPanelItem = ({ index, output }: OutputPanelItemProps): ReactElement => {
  return (
    <StyledOutputItem key={index}>
      <StyledBulletColor $backgroundColor={output.type === 'color' ? output.fill : ''} />
      <StyledLabel>{output.label ?? (output.type === 'color' ? output.fill : '')}</StyledLabel>
    </StyledOutputItem>
  );
};

const StyledOutputItem = styled.div`
  display: flex;
  width: 100%;
  gap: 8px;
  align-items: center;
`;

const StyledBulletColor = styled.span<{ $backgroundColor?: string }>`
  height: 15px;
  width: 15px;
  background: ${({ $backgroundColor }) => $backgroundColor};
  border-radius: 50%;
  display: inline-block;
`;

const StyledLabel = styled.span<{ $color?: string }>`
  color: ${({ $color }) => $color};
  line-height: 20px;
`;
