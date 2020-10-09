import React, { useMemo } from 'react';
import { ErrorFeedback, EventDetailsAbstract, Loader } from 'components/Common';
import { useResourceActionsContext } from 'context/ResourceActionsContext';
import { useSelectionButton } from 'hooks/useSelection';
import { useCdfItem } from 'hooks/sdk';
import { CogniteEvent } from '@cognite/sdk';

export const EventSmallPreview = ({
  eventId,
  actions: propActions,
  extras,
  children,
}: {
  eventId: number;
  actions?: React.ReactNode[];
  extras?: React.ReactNode[];
  children?: React.ReactNode;
}) => {
  const renderResourceActions = useResourceActionsContext();
  const selectionButton = useSelectionButton()({
    type: 'event',
    id: eventId,
  });

  const { data: event, isFetched, error } = useCdfItem<CogniteEvent>(
    'events',
    eventId
  );

  const actions = useMemo(() => {
    const items: React.ReactNode[] = [selectionButton];
    items.push(...(propActions || []));
    items.push(
      ...renderResourceActions({
        id: eventId,
        type: 'event',
      })
    );
    return items;
  }, [selectionButton, renderResourceActions, eventId, propActions]);

  if (!isFetched) {
    return <Loader />;
  }

  if (error) {
    return <ErrorFeedback error={error} />;
  }

  if (!event) {
    return <>Event {eventId} not found!</>;
  }

  return (
    <EventDetailsAbstract
      key={event.id}
      event={event}
      extras={extras}
      actions={actions}
    >
      {children}
    </EventDetailsAbstract>
  );
};
