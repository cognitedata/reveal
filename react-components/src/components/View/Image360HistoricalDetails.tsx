/*!
 * Copyright 2023 Cognite AS
 */

import { Cognite3DViewer, Image360 } from '@cognite/reveal';
import React, { useEffect, useState } from 'react';
import { Image360HistoricalPanel } from '../Panel/Image360HistoricalPanel';
import { Image360HistoricalSummary } from '../Toolbar/Image360HistoricalSummary';
import { formatDate } from '../utils/FormatDate';
import styled from 'styled-components';
import { uniqueId } from 'lodash';

export interface Image360HistoricalDetailsProps{
  viewer: Cognite3DViewer;
  image360Entity?: Image360;
};

export const Image360HistoricalDetails = ({
  viewer,
  image360Entity
}: Image360HistoricalDetailsProps) => {
  const [revisionDetailsExpanded, setRevisionDetailsExpanded] = useState<boolean>(false);
  const [activeRevision, setActiveRevision] = useState<number>(0);
  const [revisionCollection, setRevisionCollection] = useState<
    {
      date?: string;
      imageUrl?: string;
      index?: number;
      image360Entity?: Image360;
    }[]
  >([]);
  const [imageUrls, setImageUrls] = useState<(string | undefined)[]>([]);
  const [minWidth, setMinWidth] = useState('100px');

  useEffect(() => {

    const fetchRevisionCollection = async () => {
      if (image360Entity) {
        const revisions = image360Entity.getRevisions();
        const revisionDates = revisions.map((revision) => revision.date);
        const imageDatas = await Promise.all(revisions.map( async revision => await revision.getPreviewThumbnailUrl()));
        setImageUrls(imageDatas);

        const collection = revisionDates.map((date, index) => {
          return {
            date: formatDate(date!),
            imageUrl: imageDatas[index]!,
            index: index,
            image360Entity: image360Entity
          }
        });

        setRevisionCollection(collection);
        setActiveRevision(0);
      }
    };

    fetchRevisionCollection();

    return() => {
      // Remove image urls
      imageUrls.forEach((url) => {
        setTimeout(() => {
          if (url) {
            URL.revokeObjectURL(url);
          }
        }, 250);
      });
      setImageUrls([]);
    };
  }, [image360Entity]);

  useEffect(() => {
    const newMinWidth = revisionDetailsExpanded ? '100%' : '100px';
    setMinWidth(newMinWidth);
  }, [revisionDetailsExpanded]);

  return(
    <DetailsContainer
      style={{ minWidth }}
    >
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
