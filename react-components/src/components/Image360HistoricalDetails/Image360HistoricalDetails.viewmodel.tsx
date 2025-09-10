import { useCallback, useMemo, useRef, useState } from 'react';
import { formatDateTime } from '@cognite/cdf-utilities';
import {
  type Image360HistoricalDetailsProps,
  type UseImage360HistoricalDetailsViewModelResult
} from './types';
import { type Image360RevisionDetails } from './Toolbar/Image360HistoricalSummary';
import { getStationIdentifier } from './utils/getStationIdentifier';

export function useImage360HistoricalDetailsViewModel({
  image360Entity,
  onExpand
}: Image360HistoricalDetailsProps): UseImage360HistoricalDetailsViewModelResult {
  const [revisionDetailsExpanded, setRevisionDetailsExpanded] = useState<boolean>(false);
  const [activeRevision, setActiveRevision] = useState<number>(0);
  const [revisionCollection, setRevisionCollection] = useState<Image360RevisionDetails[]>([]);
  const [imageUrls, setImageUrls] = useState<Array<string | undefined>>([]);
  const previousImageUrls = useRef<Array<string | undefined>>([]);
  const newScrollPosition = useRef(0);
  const previousImage360Entity = useRef(image360Entity);

  const stationId = image360Entity !== undefined ? getStationIdentifier(image360Entity) : undefined;
  const stationName = image360Entity?.label;

  const fetchRevisionCollection = useCallback(async (): Promise<void> => {
    if (image360Entity !== undefined) {
      // Clean up previous URLs
      previousImageUrls.current.forEach((url) => {
        if (url !== undefined) {
          URL.revokeObjectURL(url);
        }
      });

      const revisions = image360Entity.getRevisions();
      const revisionDates = revisions.map((revision) => revision.date);
      const imageDatas = await Promise.all(
        revisions.map(async (revision) => await revision.getPreviewThumbnailUrl())
      );

      previousImageUrls.current = imageUrls;
      setImageUrls(imageDatas);

      const collection = revisionDates.map((date, index) => {
        return {
          date: date !== undefined ? formatDateTime({ date }) : 'Date not available',
          imageUrl: imageDatas[index],
          index,
          image360Entity
        };
      });

      newScrollPosition.current = 0;
      setRevisionCollection(collection);
      setActiveRevision(0);
    }
  }, [image360Entity, imageUrls]);

  useMemo(() => {
    if (previousImage360Entity.current !== image360Entity) {
      previousImage360Entity.current = image360Entity;
      void fetchRevisionCollection();
    }
  }, [image360Entity, fetchRevisionCollection]);

  const minWidth = useMemo(() => {
    const newMinWidth = revisionDetailsExpanded ? '100%' : '100px';

    if (onExpand !== undefined) {
      setTimeout(() => {
        onExpand(revisionDetailsExpanded);
      }, 0);
    }

    return newMinWidth;
  }, [revisionDetailsExpanded, onExpand]);

  return {
    revisionDetailsExpanded,
    setRevisionDetailsExpanded,
    activeRevision,
    setActiveRevision,
    revisionCollection,
    imageUrls,
    minWidth,
    newScrollPosition,
    stationId,
    stationName
  };
}
