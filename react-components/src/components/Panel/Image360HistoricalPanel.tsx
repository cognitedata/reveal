/*!
 * Copyright 2023 Cognite AS
 */

import { Chip, Tooltip } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';

export interface Image360HistoricalPanelProps {
  revisionCount?: number;
  revisionDetailsExpanded: boolean;
  setRevisionDetailsExpanded: (detailed: boolean) => void;
}

export const Image360HistoricalPanel = ({
  revisionCount,
  revisionDetailsExpanded,
  setRevisionDetailsExpanded
}: Image360HistoricalPanelProps) => {
  const count = revisionCount?.toString();

  const onDetailsClick = () => {
    setRevisionDetailsExpanded!(!revisionDetailsExpanded);
  };

  return (
    <Container isExpanded={revisionDetailsExpanded}>
    <Tooltip content="360 Image historical details">
      <StyledToolBar onClick={onDetailsClick} isExpanded={revisionDetailsExpanded}>
        {!revisionDetailsExpanded && (
          <>
            <StyledChip icon='History' iconPlacement='right' label='Details' hideTooltip />
            <StyledChipCount label={count} hideTooltip />
          </>
          )
        }
        {revisionDetailsExpanded && (
          <StyledChip icon='PushRight' iconPlacement='right' label='Details' hideTooltip/>
        )}
      </StyledToolBar>
    </Tooltip>
    </Container>
  )
};

const StyledToolBar = styled.div<{ isExpanded: boolean }>`
  left: 30px;
  bottom: 30px;
  display: flex;
  flex-direction: row;
  padding: 0px 0px 0px 5px;
  background: #FFFFFF;

  ${({ isExpanded }) =>
  isExpanded &&
    `
    padding: 0px 0px 0px 25px;
  `}
`;

const StyledChip = styled(Chip)`
  && {
    width: fit-content;
    min-height: 20px;
    max-height: 20px;
    background-color: white;
    border-radius: 2px;
    color: rgba(0, 0, 0, 0.9);
  }
  .cogs-chip__icon--right {
    transform: rotate(90deg);
  }
`;

const StyledChipCount = styled(Chip)`
  && {
    background: #5874FF;
    border-radius: 2px;
    width: 20px;
    height: 20px;
    max-height: 20px;
    min-height: 20px;
    min-width: 20px;
    padding: 4px;
    color: #FFFFFF;

    /* Font */
    font-family: 'Inter';
    font-style: normal;
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;
  }
`;

const Container = styled.div<{ isExpanded: boolean }>`
  position: relative;
  left: calc(100% - 150px);
  width: 140px;
  height: 28px;
  background-color: white;
  padding: 4px 2px;
  align-items: center;
  display: flex;
  border-radius: 6px;

  ${({ isExpanded }) =>
  isExpanded &&
    `
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  `}
`;
