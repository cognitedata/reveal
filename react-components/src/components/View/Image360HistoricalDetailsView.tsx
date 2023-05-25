/*!
 * Copyright 2023 Cognite AS
 */

import { Cognite3DViewer, Image360 } from '@cognite/reveal';
import React, { useEffect, useMemo, useState } from 'react';
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
    return () => {
      setImageUrls((urls) => {
        urls.forEach((url) => {
          if (url) {
            URL.revokeObjectURL(url);
          }
        });
        return [];
      });
    };
  }, [imageUrls]);

  useMemo(async () => {
    if (image360Entity) {
      const revisionDates = image360Entity
          .getRevisions()
          .map((revision) => revision.date);
        const revisionDetails: { date: Date | undefined; imageUrl: string }[] =
          [];
        revisionDates.forEach((date) => {
          revisionDetails.push({
            date: date !== undefined ? date : undefined,
            imageUrl: '',
          });
        });

      const revisions = image360Entity.getRevisions();
      const imageDatas = await Promise.all(revisions.map( async revision => await revision.getPreviewThumbnailUrl()));
      setImageUrls(imageDatas);
      const collection: {
        date: string;
        imageUrl: string | undefined;
        index: number;
        image360Entity: Image360;
      }[] = [];
      revisionDetails.forEach((details, index) => {
        collection.push({
          date: formatDate(details.date!),
          imageUrl: imageUrls[index]!,
          index: index,
          image360Entity: image360Entity,
        });
      });
      setRevisionCollection(collection);
    }
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
