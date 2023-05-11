/*!
 * Copyright 2023 Cognite AS
 */

import { Detail, Flex } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';
import { Thumbnail } from '../utils/Thumbnail';

export interface Image360RevisionDetails{
  revisionDate?: string;
  revisionImageUrl?: string;
};

export interface Image360HistoricalOverviewToolbarProps{
  stationId?: string;
  stationName?: string;
  collectionId?: string;
  revisionCollection?: Image360RevisionDetails[];
};

export const Image360HistoricalOverviewToolbar = ({stationId, stationName, collectionId, revisionCollection}: Image360HistoricalOverviewToolbarProps) => {
  return(
    <OverviewContainer>

      <StyledSubFlex direction='column'>
        <StyledFlex>{stationName}</StyledFlex>
        <Detail>Station: {stationId}</Detail>
        <Detail>Collection: {collectionId}</Detail>
      </StyledSubFlex>

    <StyledLayoutGrid>
        { revisionCollection?.map((revisionDetails) => (
          <RevisionItem>
            <Thumbnail imageUrl={revisionDetails.revisionImageUrl} isLoading={false}/>
            <Detail>{revisionDetails.revisionDate}</Detail>
          </RevisionItem>
        ))
        }
    </StyledLayoutGrid>

    </OverviewContainer>
  )
};

const StyledFlex = styled(Flex)`
  font-weight: bold;
  font-size: 14px;
  width: fit-content;
`;

const StyledSubFlex = styled(Flex)`
  width: fit-content;
`;

const OverviewContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
`;

const RevisionItem = styled.div`
  width: 160px;
  height: 112px;
  flex-direction: column;
  border-radius: 12px;
  display: flex;
  align-items: center;
  opacity: 0.8;
`;

export const StyledLayoutGrid = styled.div`
  position: absolute;
  width: 70%;
  right: 0;
  display: grid;
  align-items: center;
  grid-auto-flow: column;
  overflow: auto;
  gap: 6px;
`;
