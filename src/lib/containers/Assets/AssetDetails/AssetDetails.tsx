import React from 'react';
import { Asset } from '@cognite/sdk';
import {
  TimeDisplay,
  DetailsTabGrid,
  DetailsTabItem,
  DataSetItem,
  Label,
} from 'lib/components';

type Props = {
  asset: Asset;
};

export const AssetDetails = ({ asset }: Props) => {
  return (
    <DetailsTabGrid>
      <DetailsTabItem name="Description" value={asset?.description} />
      <DetailsTabItem name="External ID" value={asset?.externalId} copyable />
      <DetailsTabItem name="ID" value={asset?.id} copyable />
      <DataSetItem id={asset.id} type="asset" />
      <DetailsTabItem
        name="Created at"
        value={asset ? <TimeDisplay value={asset.createdTime} /> : 'Loading...'}
      />
      <DetailsTabItem
        name="Updated at"
        value={
          asset ? <TimeDisplay value={asset.lastUpdatedTime} /> : 'Loading...'
        }
      />
      <DetailsTabItem
        name="Labels"
        value={
          asset?.labels
            ? asset?.labels.map(label => <Label>{label.externalId}</Label>)
            : undefined
        }
      />
    </DetailsTabGrid>
  );
};
