/*!
 * Copyright 2023 Cognite AS
 */

import { Cognite3DViewer, Image360 } from '@cognite/reveal';
import React, { useEffect, useState } from 'react';
import { Image360HistoricalDetailsPanel } from '../Panel/Image360HistoricalDetailsPanel';
import { Image360HistoricalOverviewToolbar } from '../Toolbar/Image360HistoricalOverviewToolbar';
import { formatDate } from '../utils/FormatDate';

export interface Image360HistoricalDetailsViewProps{
  viewer: Cognite3DViewer;
  stationId?: string;
  stationName?: string;
  collectionId?: string;
  image360Entity?: Image360;
};

export const Image360HistoricalDetailsView = ({
  viewer,
  stationId,
  stationName,
  collectionId,
  image360Entity
}: Image360HistoricalDetailsViewProps) => {
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

  useEffect(() => {
    const fetchRevisionCollection = async () => {
      if (image360Entity) {
        // Remove old image urls
        setImageUrls((urls) => {
          urls.forEach((url) => {
            if (url) {
              URL.revokeObjectURL(url);
            }
          });
          return [];
        });

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
      }
    };

    fetchRevisionCollection();
  }, [image360Entity]);

  return(
    <>
      {viewer && (
        <>
        <Image360HistoricalDetailsPanel
            key={`${stationId}`}
            revisionCount={revisionCollection.length}
            revisionDetailsExpanded={revisionDetailsExpanded}
            setRevisionDetailsExpanded={setRevisionDetailsExpanded}
        />
        {revisionDetailsExpanded && (
          <Image360HistoricalOverviewToolbar
            viewer={viewer}
            stationId={stationId}
            stationName={stationName}
            collectionId={collectionId}
            activeRevision={activeRevision}
            setActiveRevision={setActiveRevision}
            revisionCollection={revisionCollection}
          />
        )}
        </>
      )}
    </>
  );
};
