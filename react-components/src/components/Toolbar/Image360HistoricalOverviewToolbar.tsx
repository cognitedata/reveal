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
        <StyledDetail>Station: {stationId}</StyledDetail>
        <StyledDetail>Collection: {collectionId}</StyledDetail>
      </StyledSubFlex>

    <StyledLayoutGrid>
        { revisionCollection?.map((revisionDetails) => (
          <RevisionItem onClick={()=>{alert(revisionDetails.revisionDate + ' is selected')}}>
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
  max-width: 100px;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 600;
  font-size: 18px;
  line-height: 24px;
  letter-spacing: -0.014em;
  font-feature-settings: 'cv05' on;
  color: rgba(0, 0, 0, 0.9);
`;

const StyledDetail = styled(Detail)`
  max-width: 100px;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  /* or 143% */

  letter-spacing: -0.006em;
  font-feature-settings: 'ss04' on;

  /* text-icon/strong */

  color: rgba(0, 0, 0, 0.9);
`;

const StyledSubFlex = styled(Flex)`
  align-items: flex-start;
  max-width: 100px;
  height: 96px;
`;

const OverviewContainer = styled.div`
  width: 100%;
  height: 146px;
  display: flex;
  flex-direction: column;
  padding: 16px 16px 8px 16px;
  background: #FFFFFF;
  box-shadow: 0px -4px 12px rgba(0, 0, 0, 0.25);
  height: 146px;
`;

const RevisionItem = styled.div`
  width: 160px;
  height: 90px;
  flex-direction: column;
  border-radius: 12px;
  display: flex;
  align-items: center;
  opacity: 0.8;
  flex: none;
  order: 0;
  flex-grow: 0;
  flex-basis: 90%;
`;

export const StyledLayoutGrid = styled.div`
  position: absolute;
  width: 70%;
  right: 40px;
  display: grid;
  align-items: center;
  grid-auto-flow: column;
  overflow: auto;
  gap: 6px;
`;
