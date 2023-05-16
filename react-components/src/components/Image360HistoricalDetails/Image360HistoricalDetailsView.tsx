/*!
 * Copyright 2023 Cognite AS
 */

import { Cognite3DViewer, Image360 } from '@cognite/reveal';
import React, { useMemo, useState } from 'react';
import { Image360HistoricalDetailsPanel, Image360HistoricalOverviewToolbar } from '..';
import { formatDate } from '../utils/FormatDate';

export interface Image360HistoricalDetailsViewProps{
  viewer?: Cognite3DViewer;
  stationId?: string;
  stationName?: string;
  collectionId?: string;
  revision?: {
    details: { date: (Date | undefined), imageUrl: string } [];
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
  const [revisionDetailsExpanded, setRevisionDetailsExpanded] = useState<boolean>(false);
  const [activeRevision, setActiveRevision] = useState<number | null>(null);
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
      revision.details.forEach((details, index) => {
        if (details.date) {
          revisionCollection.push({
            date: formatDate(details.date),
            imageUrl: details.imageUrl,
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
            revisionDetailsExpanded={revisionDetailsExpanded}
            setRevisionDetailsExpanded={setRevisionDetailsExpanded}
        />
        {revisionDetailsExpanded && (
          <Image360HistoricalOverviewToolbar
            viewer={viewer}
            stationId={stationId}
            stationName={stationName}
            collectionId={collectionId}
            activeRevision={activeRevision ?? 0}
            setActiveRevision={setActiveRevision}
            revisionCollection={revisionCollection}
          />
        )}
        </>
      )}
    </>
  );
};
