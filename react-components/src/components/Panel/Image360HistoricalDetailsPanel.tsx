/*!
 * Copyright 2023 Cognite AS
 */

import { Button, Tooltip } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';

export interface Image360HistoricalDetailsPanelProps {
  historicalCount?: number;
  onDetailsClick?: () => void;
}

export const Image360HistoricalDetailsPanel = ({historicalCount, onDetailsClick}: Image360HistoricalDetailsPanelProps) => {
  return (
    <Tooltip content="360 Image historical details">
      <StyledToolBar>
        <Button icon='History' iconPlacement='right' onClick={onDetailsClick} aria-label="details-button"> Details
        </Button>
        <Button type="primary" disabled> {historicalCount} </Button>
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
  padding: 4px;
  border-radius: 4px;
  background-color: white;
`;
