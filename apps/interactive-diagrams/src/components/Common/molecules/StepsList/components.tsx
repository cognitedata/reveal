import styled from 'styled-components';
import { Colors, Body } from '@cognite/cogs.js';
import { StyledStepProps } from './types';

export const StyledStep = styled.div<StyledStepProps>`
  display: block;
  user-select: none;
  width: 100%;
  margin: 8px 0;
  padding: 8px;
  box-sizing: border-box;
  border-radius: 8px;
  font-size: ${({ small }) => (small ? '14px' : '16px')};
  cursor: ${({ wasVisited }) => (wasVisited ? 'pointer' : 'default')};
  background-color: ${({ isCurrent }) => (isCurrent ? '#F7F8FA' : 'none')};
  color: ${({ isCurrent, wasVisited }) =>
    isCurrent || wasVisited
      ? Colors['greyscale-grey9'].hex()
      : Colors['greyscale-grey6'].hex()};
  a {
    color: ${({ isCurrent, wasVisited }) =>
      isCurrent || wasVisited
        ? Colors['greyscale-grey9'].hex()
        : Colors['greyscale-grey6'].hex()};
  }
  &:hover {
    background-color: ${({ wasVisited }) => (wasVisited ? '#f7f8fa' : 'none')};
  }
`;

export const StepNumber = styled.span.attrs((props: StyledStepProps) => {
  const { isCurrent, wasVisited, small = false } = props;
  const style: any = {
    backgroundColor: Colors.white.hex(),
    border: `${small ? '2' : '3'}px solid ${Colors['greyscale-grey6'].hex()}`,
  };
  if (wasVisited) {
    style.backgroundColor = Colors.green.hex();
    style.color = Colors.white.hex();
    style.border = `3px solid ${Colors.green.hex()}`;
  }
  if (isCurrent) {
    style.backgroundColor = Colors.midblue.hex();
    style.color = Colors.white.hex();
    style.border = `3px solid ${Colors.midblue.hex()}`;
  }
  return { style };
})<StyledStepProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
  min-width: ${({ small }) => (small ? '24px' : '32px')};
  min-height: ${({ small }) => (small ? '24px' : '32px')};
  max-width: ${({ small }) => (small ? '24px' : '32px')};
  max-height: ${({ small }) => (small ? '24px' : '32px')};
  padding: 1px;
  border-radius: 20px;
  box-sizing: border-box;
  user-select: none;
  color: ${({ isCurrent }) =>
    isCurrent
      ? Colors['greyscale-grey9'].hex()
      : Colors['greyscale-grey6'].hex()};
`;

export const StyledAdditionalText = styled(Body)`
  color: #8c8c8c;
  font-weight: normal;
  font-size: 14px;
`;
