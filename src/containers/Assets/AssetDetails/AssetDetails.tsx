import React from 'react';
import { Asset } from '@cognite/sdk';
import { TimeDisplay, GeneralDetails } from 'components';

type Props = {
  asset: Asset;
};

export const AssetDetails = ({ asset }: Props) => (
  <GeneralDetails>
    <GeneralDetails.Item name="Name" value={asset.name} copyable />
    <GeneralDetails.Item name="Description" value={asset.description} />
    <GeneralDetails.Item name="ID" value={asset.id} copyable />
    <GeneralDetails.Item name="External ID" value={asset.externalId} copyable />
    <GeneralDetails.DataSetItem id={asset.id} type="asset" />
    <GeneralDetails.Item
      name="Created at"
      value={<TimeDisplay value={asset.createdTime} />}
    />
    <GeneralDetails.Item
      name="Updated at"
      value={<TimeDisplay value={asset.lastUpdatedTime} />}
    />
    <GeneralDetails.LabelsItem
      labels={asset.labels?.map(label => label.externalId)}
    />
  </GeneralDetails>
);
