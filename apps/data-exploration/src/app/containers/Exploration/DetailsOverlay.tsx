import React from 'react';
import { useSearchParams } from 'react-router-dom';

import { ResizableOverlay } from '@data-exploration/components';

import { VIEW_MODE_FIELD } from '@data-exploration-lib/core';

import { useGetJourney, useJourney, useViewModeToggle } from '../../hooks';
import { useFilterSidebarState } from '../../store';
import { AssetDetail } from '../Asset/AssetDetail';
import { EventDetail } from '../Event/EventDetail';
import { FileDetail } from '../File/FileDetail';
import { SequenceDetail } from '../Sequence/SequenceDetail';
import { TimeseriesDetail } from '../Timeseries/TimeseriesDetail';

export const DetailsOverlay: React.FC<unknown> = () => {
  const [showFilter] = useFilterSidebarState();
  const [searchParams] = useSearchParams();

  const [journey] = useJourney();
  const [, lastJourney] = useGetJourney();
  const [viewModeToggle, setViewModeToggle] = useViewModeToggle();
  const showOverlay = journey !== undefined;

  // Update view mode based on query param in the url
  React.useEffect(() => {
    setViewModeToggle(searchParams.has(VIEW_MODE_FIELD));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get(VIEW_MODE_FIELD)]);

  return (
    <ResizableOverlay
      id="details-overlay"
      showFilter={showFilter}
      isFullpage={viewModeToggle}
      showOverlay={showOverlay}
    >
      {/* Here select the detail type depending on the last journey's type. */}
      {lastJourney && lastJourney.type === 'asset' && (
        <AssetDetail assetId={lastJourney.id} />
      )}
      {lastJourney && lastJourney.type === 'timeSeries' && (
        <TimeseriesDetail timeseriesId={lastJourney.id} />
      )}
      {lastJourney && lastJourney.type === 'file' && (
        <FileDetail fileId={lastJourney.id} />
      )}
      {lastJourney && lastJourney.type === 'event' && (
        <EventDetail eventId={lastJourney.id} />
      )}
      {lastJourney && lastJourney.type === 'sequence' && (
        <SequenceDetail sequenceId={lastJourney.id} />
      )}
    </ResizableOverlay>
  );
};
