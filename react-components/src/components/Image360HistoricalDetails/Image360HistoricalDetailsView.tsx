/*!
 * Copyright 2023 Cognite AS
 */

import { Cognite3DViewer, Image360 } from '@cognite/reveal';
import React, { useMemo, useState } from 'react';
import { Image360HistoricalDetailsPanel, Image360HistoricalOverviewToolbar } from '..';

export interface Image360HistoricalDetailsViewProps{
  viewer?: Cognite3DViewer;
  stationId?: string;
  stationName?: string;
  collectionId?: string;
  revision?: {
    date: (Date | undefined)[];
    image: Image360;
  }
};

export const Image360HistoricalDetailsView = ({
  viewer,
  stationId,
  stationName,
  collectionId,
  revision
}: Image360HistoricalDetailsViewProps) => {
  const [revisionDetailsMode, setRevisionDetailsMode] = useState<boolean>(false);
  const [revisionCollection, setRevisionCollection] = useState<
    {
      date: string;
      imageUrl: string;
      index?: number;
      image360Entity?: Image360;
    }[]
  >();

  useMemo(() => {
    if (revision) {
      const revisionCollection: {
        date: string;
        imageUrl: string;
        index: number;
        image360Entity: Image360;
      }[] = [];
      revision.date.forEach((date, index) => {
        if (date) {
          revisionCollection.push({
            date: date.toString(),
            imageUrl: '',
            index: index,
            image360Entity: revision.image,
          });
        }
      });
      setRevisionCollection(revisionCollection);
    }
  }, [revision]);

  return(
    <>
      {viewer && (
        <>
        <Image360HistoricalDetailsPanel
            key={`${stationId}`}
            revisionDetailsMode={revisionDetailsMode}
            setRevisionDetailsMode={setRevisionDetailsMode}
        />
        {revisionDetailsMode && (
          <Image360HistoricalOverviewToolbar
            viewer={viewer}
            stationId={stationId}
            stationName={stationName}
            collectionId={collectionId}
            revisionCollection={revisionCollection}
          />
        )}
        </>
      )}
    </>
  );
};
