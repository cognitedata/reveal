/*!
 * Copyright 2023 Cognite AS
 */
import { Body, Colors, Detail, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { Mouse } from '../../Graphics/Mouse';

export const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const SectionTitle = styled(Title).attrs({ level: 3 })`
  color: #ffffff;
`;

export const SectionSubTitle = styled(Title).attrs({ level: 5 })`
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
  color: ${Colors['text-icon--medium--inverted']};
`;

export const InstructionDetail = styled(Detail)`
  color: ${Colors['text-icon--interactive--disabled--inverted']};
`;

export const MouseNavigationGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr;
  gap: 8px;
  width: 220px;

  ${InstructionText}:first-of-type {
    padding-left: 10px;
    grid-column: 1/-1;
    text-align: center;
  }

  ${InstructionText}:last-of-type {
    text-align: right;
  }
`;

export const MouseGraphic = styled(Mouse)`
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

export const TouchNavigationContainer = styled.div`
  display: flex;
  gap: 16px;
  width: 176px;
`;
