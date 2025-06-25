import { Body, Heading } from '@cognite/cogs.js';
import styled from 'styled-components';
import { Mouse } from './Graphics/Mouse';

export const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: fit-content;
  max-width: fit-content;
`;

export const SectionTitle = styled(Heading).attrs({ level: 3 })`
  color: #ffffff;
`;

export const SectionSubTitle = styled(Heading).attrs({ level: 5 })`
  color: #ffffff;
`;

export const SectionContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  height: 100%;
`;

export const InstructionText = styled(Body).attrs({
  level: 3,
  strong: true
})`
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
`;

export const InstructionDetail = styled(Body).attrs({
  size: 'small'
})`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0.006em;
  white-space: pre-line;
`;

export const MouseNavigationInstructionGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr;
  gap: 8px;
  width: fit-content;
  justify-items: center;
  align-items: center;
  padding-top: 12px;

  ${InstructionText}:first-of-type {
    padding-left: 10px;
    grid-column: 1/-1;
    text-align: right;
  }

  ${InstructionText}:last-of-type {
    text-align: left;
  }
`;

export const MouseNavigationCombinedGridItem = styled.div`
  grid-column: 2 / 3;
  grid-row: 2 / 3;
`;

export const KeyboardNavigationInstructionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  width: fit-content;
  justify-items: center;
  align-items: center;
  text-align: center;
`;

export const ArrowKeyboardNavigationInstructionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  padding-left: 12px;
  width: fit-content;
  justify-items: center;
  align-items: center;

  ${InstructionText}:first-of-type {
    padding-left: 10px;
    grid-column: 1/-1;
    text-align: right;
  }

  ${InstructionText}:last-of-type {
    text-align: center;
  }
`;

export const TouchNavigationInstructionGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr;
  width: fit-content;
  justify-items: center;
  padding-top: 12px;

  ${InstructionText}:first-of-type {
    padding-left: 10px;
    grid-column: 1/-1;
    text-align: right;
  }

  ${InstructionText}:last-of-type {
    text-align: center;
  }
`;

export const TouchNavigationCombinedGridItem = styled.div`
  grid-column: 2 / 3;
  grid-row: 1 / 3;
  padding-top: 40px;
`;

export const StyledMouse = styled(Mouse)`
  display: flex;
  justify-content: center;

  ::before {
    content: '';
    position: absolute;
    display: inline-block;
    margin-top: 12px;
    width: 110px;
    border-top: 1px solid white;
  }
`;
