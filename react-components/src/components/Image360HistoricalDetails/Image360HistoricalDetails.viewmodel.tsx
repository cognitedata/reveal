import { useContext, useEffect, useRef, useState } from 'react';
import {
  type Image360HistoricalDetailsProps,
  type UseImage360HistoricalDetailsViewModelResult
} from './types';
import { type Image360RevisionDetails } from './Toolbar/Image360HistoricalSummary';
import { getStationIdentifier } from './utils/getStationIdentifier';
import { Image360HistoricalDetailsViewModelContext } from './Image360HistoricalDetails.viewmodel.context';

export function useImage360HistoricalDetailsViewModel({
  image360Entity,
  onExpand
}: Image360HistoricalDetailsProps): UseImage360HistoricalDetailsViewModelResult {
  const [revisionDetailsExpanded, setRevisionDetailsExpanded] = useState<boolean>(false);
  const [activeRevision, setActiveRevision] = useState<number>(0);
  const [revisionCollection, setRevisionCollection] = useState<Image360RevisionDetails[]>([]);
  const [imageUrls, setImageUrls] = useState<Array<string | undefined>>([]);
  const newScrollPosition = useRef(0);

  const { formatDateTime, revokeObjectUrl } = useContext(Image360HistoricalDetailsViewModelContext);

  const stationId = image360Entity !== undefined ? getStationIdentifier(image360Entity) : undefined;
  const stationName = image360Entity?.label;

  useEffect(() => {
    const fetchRevisionCollection = async (): Promise<void> => {
      if (image360Entity !== undefined) {
        const revisions = image360Entity.getRevisions();
        const revisionDates = revisions.map((revision) => revision.date);
        const imageDatas = await Promise.all(
          revisions.map(async (revision) => await revision.getPreviewThumbnailUrl())
        );
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
    };

    void fetchRevisionCollection();

    return () => {
      // Remove image URLs
      imageUrls.forEach((url) => {
        if (url !== undefined) {
          revokeObjectUrl(url);
        }
      });
      setImageUrls([]);
    };
  }, [image360Entity, imageUrls, revokeObjectUrl, formatDateTime]);

  useEffect(() => {
    if (onExpand !== undefined) {
      onExpand(revisionDetailsExpanded);
    }
  }, [revisionDetailsExpanded, onExpand]);

  return {
    revisionDetailsExpanded,
    setRevisionDetailsExpanded,
    activeRevision,
    setActiveRevision,
    revisionCollection,
    imageUrls,
    newScrollPosition,
    stationId,
    stationName
  };
}
