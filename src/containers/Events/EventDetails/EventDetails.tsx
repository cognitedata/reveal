import React from 'react';
import { CogniteEvent } from '@cognite/sdk';
import {
  TimeDisplay,
  DetailsTabGrid,
  DetailsTabItem,
  DataSetItem,
  AssetsItem,
} from 'components';

export const EventDetails = ({ event }: { event: CogniteEvent }) => {
  return (
    <DetailsTabGrid>
      <DetailsTabItem name="Type" value={event.type} copyable />
      <DetailsTabItem name="Sub type" value={event.subtype} copyable />
      <DetailsTabItem name="Description" value={event.description} />
      <DetailsTabItem name="ID" value={event.id} copyable />
      <DetailsTabItem name="External ID" value={event.externalId} copyable />
      <DetailsTabItem
        name="Start time"
        value={event ? <TimeDisplay value={event.startTime} /> : 'Loading...'}
      />
      <DetailsTabItem
        name="End time"
        value={event ? <TimeDisplay value={event.endTime} /> : 'Loading...'}
      />
      <DataSetItem id={event.id} type="event" />
      <AssetsItem assetIds={event.assetIds} linkId={event.id} type="event" />
      <DetailsTabItem
        name="Created at"
        value={event ? <TimeDisplay value={event.createdTime} /> : 'Loading...'}
      />
      <DetailsTabItem
        name="Updated at"
        value={
          event ? <TimeDisplay value={event.lastUpdatedTime} /> : 'Loading...'
        }
      />
    </DetailsTabGrid>
  );
};
