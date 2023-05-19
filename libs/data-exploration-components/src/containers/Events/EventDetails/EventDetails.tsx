import React from 'react';
import { CogniteEvent } from '@cognite/sdk';
import { GeneralDetails } from '@data-exploration-components/components';
import { TimeDisplay } from '@data-exploration/components';

export const EventDetails = ({ event }: { event: CogniteEvent }) => (
  <GeneralDetails>
    <GeneralDetails.Item
      name="Type"
      key={`${event.type}-${event.id}`}
      value={event.type}
      copyable
    />
    <GeneralDetails.Item
      key={`${event.subtype}-${event.id}`}
      name="Sub type"
      value={event.subtype}
      copyable
    />
    <GeneralDetails.Item
      name="Description"
      value={event.description}
      copyable
    />
    <GeneralDetails.Item key={event.id} name="ID" value={event.id} copyable />
    <GeneralDetails.Item
      key={event.externalId}
      name="External ID"
      value={event.externalId}
      copyable
    />
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
    <GeneralDetails.Item
      key={event.source}
      name="Source"
      value={event.source}
      copyable
    />
  </GeneralDetails>
);
