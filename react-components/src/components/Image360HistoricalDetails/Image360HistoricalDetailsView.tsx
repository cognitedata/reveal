/*!
 * Copyright 2023 Cognite AS
 */

import { Cognite3DViewer, Image360 } from '@cognite/reveal';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Image360HistoricalDetailsPanel } from '../Panel/Image360HistoricalDetailsPanel';
import { Image360HistoricalOverviewToolbar } from '../Toolbar/Image360HistoricalOverviewToolbar';
import { formatDate } from '../utils/FormatDate';
import { use360ImageThumbnail } from '../../services/queries/use360ImageStationThumbnailQuery';
import { getObjectURL } from '../../services/utils/files';

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

  const imageDatas = use360ImageThumbnail(stationId);

  const setImageBlob = useCallback((imageData: ArrayBuffer[]) => {
    if (!imageData) {
      return;
    }
    const newUrls = imageDatas.map((imageData) => {
      const objectURL = getObjectURL(imageData);
      return objectURL;
    });

    setImageUrls((prevUrls) => [...prevUrls, ...newUrls]);
  }, []);

  useEffect(() => {
    setImageBlob(imageDatas);

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
  }, [imageDatas, setImageBlob]);

  useMemo(() => {
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
      const collection: {
        date: string;
        imageUrl: string | undefined;
        index: number;
        image360Entity: Image360;
      }[] = [];
      revisionDetails.forEach((details, index) => {
        collection.push({
          date: formatDate(details.date!),
          imageUrl: '',
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
