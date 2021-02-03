import React from 'react';
import { Sequence } from '@cognite/sdk';
import {
  TimeDisplay,
  DetailsTabGrid,
  DetailsTabItem,
  DataSetItem,
  AssetsItem,
} from 'components';

export const SequenceDetails = ({ sequence }: { sequence: Sequence }) => (
  <DetailsTabGrid>
    <DetailsTabItem name="Name" value={sequence.name} copyable />
    <DetailsTabItem name="Description" value={sequence.description} />
    <DetailsTabItem name="ID" value={sequence.id} copyable />
    <DetailsTabItem name="External ID" value={sequence.externalId} copyable />
    <DataSetItem id={sequence.id} type="sequence" />
    <AssetsItem
      assetIds={sequence.assetId ? [sequence.assetId] : undefined}
      linkId={sequence.id}
      type="sequence"
    />
    <DetailsTabItem
      name="Created at"
      value={
        sequence ? <TimeDisplay value={sequence.createdTime} /> : 'Loading...'
      }
    />
    <DetailsTabItem
      name="Updated at"
      value={
        sequence ? (
          <TimeDisplay value={sequence.lastUpdatedTime} />
        ) : (
          'Loading...'
        )
      }
    />
  </DetailsTabGrid>
);
