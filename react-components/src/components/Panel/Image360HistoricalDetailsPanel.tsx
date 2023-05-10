/*!
 * Copyright 2023 Cognite AS
 */

import { Chip, Tooltip } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';

export interface Image360HistoricalDetailsPanelProps {
  historicalCount?: number;
  onDetailsClick?: () => void;
}

export const Image360HistoricalDetailsPanel = ({historicalCount, onDetailsClick}: Image360HistoricalDetailsPanelProps) => {
  const count = historicalCount?.toString();

  return (
    <Tooltip content="360 Image historical details">
      <StyledToolBar>
        <StyledChip icon='History' iconPlacement='right' onClick={onDetailsClick} label='Details'/>
        <StyledChip label={count} type='neutral' hideTooltip/>
      </StyledToolBar>
    </Tooltip>
  )
};

const StyledToolBar = styled.div`
  left: 30px;
  bottom: 30px;
  display: flex;
  flex-direction: row;
  width: fit-content;
  height: fit-content;
  padding: 4px, 10px, 4px, 10px;
  border-radius: 6px;
  background-color: white;
`;

export const StyledChip = styled(Chip)`
  && {
    width: fit-content;
    max-height: 28px;
    background-color: white;
  }
`;
