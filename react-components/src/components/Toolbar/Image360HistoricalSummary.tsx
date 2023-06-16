/*!
 * Copyright 2023 Cognite AS
 */

import { Detail, Flex } from '@cognite/cogs.js';
import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Thumbnail } from '../utils/Thumbnail';
import { Cognite3DViewer, Image360 } from '@cognite/reveal';
// Using named import to avoid react component creation error when default import is used.
import { uniqueId } from 'lodash';

export interface Image360RevisionDetails{
  date?: string;
  imageUrl?: string;
  index: number;
  image360Entity: Image360 | undefined;
};

export interface Image360HistoricalSummaryProps{
  stationId?: string;
  stationName?: string;
  viewer?: Cognite3DViewer;
  revisionCollection: Image360RevisionDetails[];
  activeRevision: number;
  setActiveRevision: (index: number) => void;
  scrollPosition: number;
  setScrollPosition: (position: number) => void;
};

export const Image360HistoricalSummary = ({
  stationId,
  stationName,
  revisionCollection,
  activeRevision,
  setActiveRevision,
  viewer,
  scrollPosition,
  setScrollPosition
}: Image360HistoricalSummaryProps) => {
  const gridContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gridContainerRef.current) {
      gridContainerRef.current.scrollLeft = scrollPosition;
    }
  }, []);

  const onRevisionChanged = (revisionDetails: Image360RevisionDetails, index: number) => {
    if(viewer && revisionDetails.image360Entity) {
      setActiveRevision(index);
      const revisions = revisionDetails.image360Entity.getRevisions();
      const revisionIndex = revisionDetails.index!;
      if (revisionIndex >= 0 && revisionIndex < revisions.length) {
        viewer.enter360Image(revisionDetails.image360Entity, revisions[revisionIndex]);
      }

      if (gridContainerRef.current) {
        setScrollPosition(gridContainerRef.current.scrollLeft);
      }
    }
  };

  return(
    <OverviewContainer>
      <StyledFlex direction='column'>
        <StyledSubFlex>{stationName}</StyledSubFlex>
        <StyledDetail>Station: {stationId}</StyledDetail>
      </StyledFlex>

      <StyledLayoutGridContainer
        ref={gridContainerRef}>
        <StyledLayoutGrid>
          { revisionCollection.map((revisionDetails, index) => (
            <RevisionItem
              key={uniqueId()}
              onClick={onRevisionChanged.bind(null, revisionDetails, index)}
            >
              <Thumbnail
                key={index}
                isActive={activeRevision === index}
                imageUrl={revisionDetails.imageUrl}
                isLoading={false}/>
              <Detail style={{height:'16px'}}>{revisionDetails.date}</Detail>
            </RevisionItem>
          ))
          }
        </StyledLayoutGrid>
      </StyledLayoutGridContainer>
    </OverviewContainer>
  )
};

const StyledSubFlex = styled(Flex)`
  align-items: flex-start;
  margin-bottom: 10px;

  //Restrict text length
  overflow:hidden;
  display:inline-block;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledFlex = styled(Flex)`
  max-width: 25%;
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
  font-family: 'Inter';
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.006em;
  font-feature-settings: 'ss04' on;
  color: rgba(0, 0, 0, 0.9);

  //Restrict text length
  overflow:hidden;
  display:inline-block;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledLayoutGridContainer = styled.div`
  width: 70%;
  height: fit-content;
  overflow-x: auto;

  /* Customize scrollbar styles */
  scrollbar-width: thin;
  scrollbar-color: #999999 #D9D9D9;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background-color: #D9D9D9;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #999999;
    border-radius: 2px;
  }
`;

const StyledLayoutGrid = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  gap: 6px;
  justify-content: flex-end;
  min-width: fit-content;
`;

const RevisionItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0.8;
  gap: 10px;
`;

const OverviewContainer = styled.div`
  display: flex;
  height: fit-content;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 16px 8px 16px;
  background: #FFFFFF;
  box-shadow: 0px -4px 12px rgba(0, 0, 0, 0.25);
`;
