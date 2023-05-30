/*!
 * Copyright 2023 Cognite AS
 */

import { Chip, Tooltip } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';

export interface Image360HistoricalDetailsPanelProps {
  revisionCount?: number;
  revisionDetailsExpanded?: boolean;
  setRevisionDetailsExpanded?: (detailed: boolean) => void;
}

export const Image360HistoricalDetailsPanel = ({
  revisionCount,
  revisionDetailsExpanded,
  setRevisionDetailsExpanded
}: Image360HistoricalDetailsPanelProps) => {
  const count = revisionCount?.toString();

  const onDetailsClick = () => {
    setRevisionDetailsExpanded!(!revisionDetailsExpanded);
  };

  return (
    <Tooltip content="360 Image historical details">
      <StyledToolBar onClick={onDetailsClick} isExpanded={revisionDetailsExpanded!}>
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
  )
};

const StyledToolBar = styled.div<{ isExpanded: boolean }>`
  left: 30px;
  bottom: 30px;
  display: flex;
  flex-direction: row;
  align-items: center;
  width: fit-content;
  height: 28px;
  padding: 0px 10px 0px 10px;
  background: #FFFFFF;
  border-radius: 6px;

  ${({ isExpanded }) =>
  isExpanded &&
    `
    padding: 0px 15px 0px 0px;
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
