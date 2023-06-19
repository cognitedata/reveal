/*!
 * Copyright 2023 Cognite AS
 */

import { Cognite3DViewer, Image360 } from '@cognite/reveal';
import React, { useEffect, useRef, useState } from 'react';
import { Image360HistoricalPanel } from '../Panel/Image360HistoricalPanel';
import { Image360HistoricalSummary } from '../Toolbar/Image360HistoricalSummary';
import { formatDate } from '../utils/FormatDate';
import styled from 'styled-components';
// Using named import to avoid react component creation error when default import is used.
import { uniqueId } from 'lodash';

export interface Image360HistoricalDetailsProps {
  viewer: Cognite3DViewer;
  image360Entity?: Image360;
  onExpand?: (isExpanded: boolean) => void;
}

export const Image360HistoricalDetails = ({
  viewer,
  image360Entity,
  onExpand
}: Image360HistoricalDetailsProps) => {
  const [revisionDetailsExpanded, setRevisionDetailsExpanded] = useState<boolean>(false);
  const [activeRevision, setActiveRevision] = useState<number>(0);
  const [revisionCollection, setRevisionCollection] = useState<
    {
      date?: string;
      imageUrl?: string;
      index: number;
      image360Entity: Image360 | undefined;
    }[]
  >([]);
  const [imageUrls, setImageUrls] = useState<(string | undefined)[]>([]);
  const [minWidth, setMinWidth] = useState('100px');
  const [scrollPosition, setScrollPosition] = useState(0);
  const newScrollPosition = useRef(0);

  useEffect(() => {
    const fetchRevisionCollection = async () => {
      if (image360Entity) {
        const revisions = image360Entity.getRevisions();
        const revisionDates = revisions.map((revision) => revision.date);
        const imageDatas = await Promise.all(revisions.map(async (revision) => await revision.getPreviewThumbnailUrl()));
        setImageUrls(imageDatas);

        const collection = revisionDates.map((date, index) => {
          return {
            date: formatDate(date!),
            imageUrl: imageDatas[index]!,
            index: index,
            image360Entity: image360Entity
          };
        });

        setRevisionCollection(collection);
        setActiveRevision(0);
        setScrollPosition(0);
      }
    };

    fetchRevisionCollection();

    return () => {
      // Remove image URLs
      imageUrls.forEach((url) => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });
      setImageUrls([]);
    };
  }, [image360Entity]);

  useEffect(() => {
    const newMinWidth = revisionDetailsExpanded ? '100%' : '100px';
    setMinWidth(newMinWidth);
    if (onExpand) {
      onExpand(revisionDetailsExpanded);
    }
  }, [revisionDetailsExpanded]);

  return (
    <DetailsContainer style={{ minWidth }}>
      {viewer && (
        <>
          <Image360HistoricalPanel
            key={uniqueId()}
            revisionCount={revisionCollection.length}
            revisionDetailsExpanded={revisionDetailsExpanded}
            setRevisionDetailsExpanded={setRevisionDetailsExpanded}
          />
          {revisionDetailsExpanded && (
            <Image360HistoricalSummary
              ref={newScrollPosition}
              key={uniqueId()}
              viewer={viewer}
              stationId={image360Entity?.id}
              stationName={image360Entity?.label}
              activeRevision={activeRevision}
              setActiveRevision={setActiveRevision}
              revisionCollection={revisionCollection}
            />
          )}
        </>
      )}
    </DetailsContainer>
  );
};

const DetailsContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  height: fit-content;
  width: 100%;
`;
