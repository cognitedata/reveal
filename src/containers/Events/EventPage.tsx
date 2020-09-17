import React, { useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { retrieve as retrieveFile } from '@cognite/cdf-resources-store/dist/files';
import { useResourcesDispatch } from '@cognite/cdf-resources-store';
import { trackUsage } from 'utils/Metrics';
import { Loader } from 'components/Common';
import ResourceSelectionContext from 'context/ResourceSelectionContext';
import { EventPreview } from './EventPreview';

export const EventPage = () => {
  const dispatch = useResourcesDispatch();
  const { eventId } = useParams<{
    eventId: string | undefined;
  }>();
  const eventIdNumber = eventId ? parseInt(eventId, 10) : undefined;

  const { resourcesState, setResourcesState } = useContext(
    ResourceSelectionContext
  );
  const isActive = resourcesState.some(
    el =>
      el.state === 'active' && el.id === eventIdNumber && el.type === 'event'
  );

  useEffect(() => {
    if (eventIdNumber && !isActive) {
      setResourcesState(
        resourcesState
          .filter(el => el.state !== 'active')
          .concat([{ id: eventIdNumber, type: 'event', state: 'active' }])
      );
    }
  }, [isActive, resourcesState, eventIdNumber, setResourcesState]);

  useEffect(() => {
    trackUsage('Exploration.Event', { eventId: eventIdNumber });
  }, [eventIdNumber]);

  useEffect(() => {
    if (eventIdNumber) {
      (async () => {
        await dispatch(retrieveFile([{ id: eventIdNumber }]));
      })();
    }
  }, [dispatch, eventIdNumber]);

  if (!eventIdNumber) {
    return <Loader />;
  }
  return <EventPreview eventId={eventIdNumber} />;
};
