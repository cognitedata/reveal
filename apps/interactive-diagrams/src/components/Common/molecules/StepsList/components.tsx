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
      ? Colors['decorative--grayscale--900']
      : Colors['decorative--grayscale--600']};
  a {
    color: ${({ isCurrent, wasVisited }) =>
      isCurrent || wasVisited
        ? Colors['decorative--grayscale--900']
        : Colors['decorative--grayscale--600']};
  }
  &:hover {
    background-color: ${({ wasVisited }) => (wasVisited ? '#f7f8fa' : 'none')};
  }
`;

export const StepNumber = styled.span.attrs((props: StyledStepProps) => {
  const { isCurrent, wasVisited, small = false } = props;
  const style: any = {
    backgroundColor: Colors['decorative--grayscale--white'],
    border: `${small ? '2' : '3'}px solid ${
      Colors['decorative--grayscale--600']
    }`,
  };
  if (wasVisited) {
    style.backgroundColor = Colors['decorative--green--500'];
    style.color = Colors['decorative--grayscale--white'];
    style.border = `3px solid ${Colors['decorative--green--500']}`;
  }
  if (isCurrent) {
    style.backgroundColor = Colors['decorative--blue--500'];
    style.color = Colors['decorative--grayscale--white'];
    style.border = `3px solid ${Colors['decorative--blue--500']}`;
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
      ? Colors['decorative--grayscale--900']
      : Colors['decorative--grayscale--600']};
`;

export const StyledAdditionalText = styled(Body)`
  color: #8c8c8c;
  font-weight: normal;
  font-size: 14px;
`;
