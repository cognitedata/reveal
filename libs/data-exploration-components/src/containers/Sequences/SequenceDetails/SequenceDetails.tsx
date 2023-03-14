import React from 'react';
import { Sequence } from '@cognite/sdk';
import {
  TimeDisplay,
  GeneralDetails,
} from '@data-exploration-components/components';

export const SequenceDetails = ({ sequence }: { sequence: Sequence }) => (
  <GeneralDetails>
    <GeneralDetails.Item
      key={sequence.name}
      name="Name"
      value={sequence.name}
      copyable
    />
    <GeneralDetails.Item name="Description" value={sequence.description} />
    <GeneralDetails.Item
      key={sequence.id}
      name="ID"
      value={sequence.id}
      copyable
    />
    <GeneralDetails.Item
      key={sequence.externalId}
      name="External ID"
      value={sequence.externalId}
      copyable
    />
    <GeneralDetails.DataSetItem id={sequence.id} type="sequence" />
    <GeneralDetails.AssetsItem
      assetIds={sequence.assetId ? [sequence.assetId] : undefined}
      linkId={sequence.id}
      type="sequence"
    />
    <GeneralDetails.Item
      name="Created at"
      value={<TimeDisplay value={sequence.createdTime} />}
    />
    <GeneralDetails.Item
      name="Updated at"
      value={<TimeDisplay value={sequence.lastUpdatedTime} />}
    />
  </GeneralDetails>
);
