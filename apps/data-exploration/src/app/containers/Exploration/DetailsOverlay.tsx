import React from 'react';
import { useSearchParams } from 'react-router-dom';

import { ResizableOverlay } from '@data-exploration/components';
import styled from 'styled-components/macro';

import { AssetDetail } from '@data-exploration-app/containers/Asset/AssetDetail';
import { EventDetail } from '@data-exploration-app/containers/Event/EventDetail';
import { FileDetail } from '@data-exploration-app/containers/File/FileDetail';
import { SequenceDetail } from '@data-exploration-app/containers/Sequence/SequenceDetail';
import { TimeseriesDetail } from '@data-exploration-app/containers/Timeseries/TimeseriesDetail';
import {
  useGetJourney,
  useJourney,
  useViewModeToggle,
} from '@data-exploration-app/hooks';
import { useFilterSidebarState } from '@data-exploration-app/store';
import { VIEW_MODE_FIELD } from '@data-exploration-lib/core';

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
    <DetailsOverlayWrapper id="details-overlay">
      <ResizableOverlay
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
    </DetailsOverlayWrapper>
  );
};

const DetailsOverlayWrapper = styled.div`
  display: contents;
`;
