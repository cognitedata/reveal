import styled, { css } from 'styled-components';

import { Body, Button, Title } from '@cognite/cogs.js';

export const OrientationWrapper = styled.div`
  --walkthrough-background-color: var(--cogs-decorative--blue--500);
  display: flex;
  flex-direction: column;
  position: relative;
  width: var(--walkthrough-width, 223px);
  padding: 16px;
  border-radius: 12px;
  background-color: var(--walkthrough-background-color);
  color: var(--cogs-text-icon--on-contrast--strong);
  max-height: 400px;
  max-width: 300px;
  overflow: auto;
`;
export const OrientationFooter = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 32px;
`;

export const OrientationButtons = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  align-items: center;
`;

export const OrientationButtonNext = styled(Button)`
  color: var(--cogs-decorative--blue--500) !important;
  box-shadow: none !important;

  &:hover {
    background-color: var(--cogs-decorative--blue--200) !important;
  }

  &:active {
    background-color: var(--cogs-decorative--blue--300) !important;
  }
`;

export const OrientationCounter = styled.div`
  .counter--total {
    color: var(--cogs-text-icon--medium--inverted);
  }
`;
export const OrientationButtonPrevious = styled(Button)`
  &:active {
    background-color: var(--cogs-decorative--blue--300) !important;
  }

  &:hover {
    background-color: var(--cogs-decorative--blue--400) !important;
  }
`;

export const OrientationButtonClose = styled(Button)`
  position: absolute;
  right: 16px;
  color: var(--cogs-text-icon--on-contrast--strong);

  svg {
    color: var(--cogs-text-icon--on-contrast--strong);
  }
`;

export const OrientationIconWrapper = styled.div`
  min-height: 64px;
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: var(--cogs-decorative--blue--400);
  color: var(--cogs-text-icon--on-contrast--strong);
  width: 64px;
  border-radius: 120px;
  margin-bottom: 16px;
`;

export const StyledTitle = styled(Title)`
  color: var(--cogs-text-icon--on-contrast--strong);
`;
export const StyledDescription = styled(Body)`
  color: var(--cogs-text-icon--on-contrast--strong);
`;
