import React from 'react';
import { CogniteEvent } from '@cognite/sdk';
import { TimeDisplay, GeneralDetails } from 'components';

export const EventDetails = ({ event }: { event: CogniteEvent }) => (
  <GeneralDetails>
    <GeneralDetails.Item name="Type" value={event.type} copyable />
    <GeneralDetails.Item name="Sub type" value={event.subtype} copyable />
    <GeneralDetails.Item name="Description" value={event.description} />
    <GeneralDetails.Item name="ID" value={event.id} copyable />
    <GeneralDetails.Item name="External ID" value={event.externalId} copyable />
    <GeneralDetails.Item
      name="Start time"
      value={<TimeDisplay value={event.startTime} />}
    />
    <GeneralDetails.Item
      name="End time"
      value={<TimeDisplay value={event.endTime} />}
    />
    <GeneralDetails.DataSetItem id={event.id} type="event" />
    <GeneralDetails.AssetsItem
      assetIds={event.assetIds}
      linkId={event.id}
      type="event"
    />
    <GeneralDetails.Item
      name="Created at"
      value={<TimeDisplay value={event.createdTime} />}
    />
    <GeneralDetails.Item
      name="Updated at"
      value={<TimeDisplay value={event.lastUpdatedTime} />}
    />
  </GeneralDetails>
);
