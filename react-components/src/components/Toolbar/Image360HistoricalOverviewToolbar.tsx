/*!
 * Copyright 2023 Cognite AS
 */

import { Detail, Flex } from '@cognite/cogs.js';
import React, { useState } from 'react';
import styled from 'styled-components';
import { Thumbnail } from '../utils/Thumbnail';
import { Cognite3DViewer, Image360 } from '@cognite/reveal';

export interface Image360RevisionDetails{
  date?: string;
  imageUrl?: string;
  index?: number;
  image360Entity?: Image360;
};

export interface Image360HistoricalOverviewToolbarProps{
  stationId?: string;
  stationName?: string;
  collectionId?: string;
  revisionCollection?: Image360RevisionDetails[];
  viewer: Cognite3DViewer;
};

export const Image360HistoricalOverviewToolbar = ({
  stationId,
  stationName,
  collectionId,
  revisionCollection,
  viewer
}: Image360HistoricalOverviewToolbarProps) => {
  const [activeRevision, setActiveRevision] = useState<number | null>(null);

  return(
    <OverviewContainer>
      <StyledSubFlex direction='column'>
        <StyledFlex>{stationName}</StyledFlex>
        <StyledDetail>Station: {stationId}</StyledDetail>
        <StyledDetail>Collection: {collectionId}</StyledDetail>
      </StyledSubFlex>

      <StyledLayoutGrid>
        { revisionCollection?.map((revisionDetails, index) => (
          <RevisionItem
            key={index}
            isActive={activeRevision === index}
            onClick={ () => {
              if(viewer && revisionDetails.image360Entity) {
                setActiveRevision(index)
                const revisions = revisionDetails.image360Entity.getRevisions();
                const revisionIndex = revisionDetails.index!;
                if (revisionIndex >= 0 && revisionIndex < revisions.length) {
                  viewer.enter360Image(revisionDetails.image360Entity, revisions[revisionIndex]);
                }
              }
              }
            }
          >
            <Thumbnail imageUrl={revisionDetails.imageUrl} isLoading={false}/>
            <Detail>{revisionDetails.date}</Detail>
          </RevisionItem>
        ))
        }
      </StyledLayoutGrid>
    </OverviewContainer>
  )
};

const StyledFlex = styled(Flex)`
  max-width: 200px;
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
  max-width: 200px;
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.006em;
  font-feature-settings: 'ss04' on;
  color: rgba(0, 0, 0, 0.9);
`;

const StyledSubFlex = styled(Flex)`
  align-items: flex-start;
  max-width: 200px;
  height: 96px;
`;

const OverviewContainer = styled.div`
  width: 100%;
  height: 136px;
  display: flex;
  flex-direction: column;
  padding: 16px 16px 8px 16px;
  background: #FFFFFF;
  box-shadow: 0px -4px 12px rgba(0, 0, 0, 0.25);
  height: 146px;
`;

const RevisionItem = styled.div<{ isActive: boolean }>`
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

  ${({ isActive }) =>
    isActive &&
    `
    border: 4px solid #4A67FB;
  `}
`;

const StyledLayoutGrid = styled.div`
  position: absolute;
  width: 70%;
  height: 112px;
  right: 20px;
  display: grid;
  align-items: center;
  grid-auto-flow: column;
  overflow: auto;
  gap: 6px;
`;
