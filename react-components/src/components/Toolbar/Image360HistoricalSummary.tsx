/*!
 * Copyright 2023 Cognite AS
 */

import { Detail, Flex } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';
import { Thumbnail } from '../utils/Thumbnail';
import { Cognite3DViewer, Image360 } from '@cognite/reveal';
import uniqueId from 'lodash/uniqueId';

export interface Image360RevisionDetails{
  date?: string;
  imageUrl?: string;
  index?: number;
  image360Entity?: Image360;
};

export interface Image360HistoricalSummaryProps{
  stationId?: string;
  stationName?: string;
  revisionCollection?: Image360RevisionDetails[];
  activeRevision?: number;
  setActiveRevision?: (index: number) => void;
  viewer?: Cognite3DViewer;
};

export const Image360HistoricalSummary = ({
  stationId,
  stationName,
  revisionCollection,
  activeRevision,
  setActiveRevision,
  viewer
}: Image360HistoricalSummaryProps) => {

  const onRevisionChanged = (revisionDetails: Image360RevisionDetails, index: number) => {
    if(viewer && revisionDetails.image360Entity) {
      setActiveRevision!(index)
      const revisions = revisionDetails.image360Entity.getRevisions();
      const revisionIndex = revisionDetails.index!;
      if (revisionIndex >= 0 && revisionIndex < revisions.length) {
        viewer.enter360Image(revisionDetails.image360Entity, revisions[revisionIndex]);
      }
    }
  };

  return(
    <OverviewContainer>
      <StyledFlex direction='column'>
        <StyledSubFlex>{stationName}</StyledSubFlex>
        <StyledDetail>Station: {stationId}</StyledDetail>
      </StyledFlex>

      <StyledLayoutGridContainer>
        <StyledLayoutGrid>
          { revisionCollection?.map((revisionDetails, index) => (
            <RevisionItem
              key={uniqueId()}
              onClick={onRevisionChanged.bind(null, revisionDetails, index)}
            >
              <Thumbnail
                key={index}
                isActive={activeRevision === index}
                imageUrl={revisionDetails.imageUrl}
                isLoading={false}/>
              <Detail>{revisionDetails.date}</Detail>
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
  max-width: 200px;

  //Restrict text length
  overflow:hidden;
  display:inline-block;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

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

  //Restrict text length
  overflow:hidden;
  display:inline-block;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledLayoutGridContainer = styled.div`
  position: absolute;
  width: 70%;
  height: 112px;
  right: 20px;
  overflow-x: auto;
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
  width: 160px;
  height: 112px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0.8;
  flex-shrink: 0;
`;

const OverviewContainer = styled.div`
  height: 136px;
  display: flex;
  flex-direction: column;
  padding: 16px 16px 8px 16px;
  background: #FFFFFF;
`;
