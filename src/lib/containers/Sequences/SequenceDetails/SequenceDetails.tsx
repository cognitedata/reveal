import React from 'react';
import { Sequence } from '@cognite/sdk';
import {
  TimeDisplay,
  DetailsTabGrid,
  DetailsTabItem,
  DataSetItem,
  AssetsItem,
} from 'lib';

export const SequenceDetails = ({ sequence }: { sequence: Sequence }) => {
  return (
    <DetailsTabGrid>
      <DetailsTabItem name="Description" value={sequence.description} />
      <DetailsTabItem
        name="External ID"
        value={sequence?.externalId}
        copyable
      />
      <DetailsTabItem name="ID" value={sequence.id} copyable />
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
};
