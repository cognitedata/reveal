import React from 'react';
import { CogniteEvent } from '@cognite/sdk';
import {
  TimeDisplay,
  DetailsTabGrid,
  DetailsTabItem,
  DataSetItem,
  AssetsItem,
} from 'lib/components';

export const EventDetails = ({ event }: { event: CogniteEvent }) => {
  return (
    <DetailsTabGrid>
      <DetailsTabItem name="Description" value={event.description} />
      <DetailsTabItem name="External ID" value={event.externalId} copyable />
      <DetailsTabItem name="ID" value={event.id} copyable />
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
