import React, { useEffect, useMemo } from 'react';
import { EventDetailsAbstract, Loader } from 'components/Common';
import { useDispatch, useSelector } from 'react-redux';
import { itemSelector, retrieve } from 'modules/events';
import { useResourceActionsContext } from 'context/ResourceActionsContext';
import { useSelectionButton } from 'hooks/useSelection';

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

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(retrieve([{ id: eventId }]));
  }, [dispatch, eventId]);

  const event = useSelector(itemSelector)(eventId);
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

  if (!event) {
    return <Loader />;
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
