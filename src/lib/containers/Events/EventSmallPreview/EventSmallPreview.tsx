import React, { useMemo } from 'react';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { CogniteEvent } from '@cognite/sdk';
import { ErrorFeedback, Loader } from 'lib/components';
import { EventDetailsAbstract } from 'lib/containers/Events';
import { useResourceActionsContext } from 'lib/context';
import { useSelectionButton } from 'lib/hooks/useSelection';

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

  const { data: event, isFetched, error } = useCdfItem<CogniteEvent>('events', {
    id: eventId,
  });

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
