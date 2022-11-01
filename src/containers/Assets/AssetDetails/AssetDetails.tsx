import React from 'react';
import { Asset } from '@cognite/sdk';
import { TimeDisplay, GeneralDetails } from 'components';
import { useThreeDAssetMappings } from 'hooks/threeDHooks';

type Props = {
  asset: Asset;
};

export const AssetDetails = ({ asset }: Props) => {
  const { data: threeDAssetMappings } = useThreeDAssetMappings();
  const mappings = threeDAssetMappings[asset.id];

  return (
    <GeneralDetails>
      <GeneralDetails.Item name="Name" value={asset.name} copyable />
      <GeneralDetails.Item name="Description" value={asset.description} />
      <GeneralDetails.Item name="ID" value={asset.id} copyable />
      <GeneralDetails.Item
        name="External ID"
        value={asset.externalId}
        copyable
      />
      <GeneralDetails.DataSetItem id={asset.id} type="asset" />
      <GeneralDetails.Item
        name="Created at"
        value={<TimeDisplay value={asset.createdTime} />}
      />
      <GeneralDetails.Item
        name="Updated at"
        value={<TimeDisplay value={asset.lastUpdatedTime} />}
      />
      {!!mappings && (
        <GeneralDetails.ThreeDModelItem
          assetId={asset.id}
          mappings={mappings}
        />
      )}
      <GeneralDetails.LabelsItem
        labels={asset.labels?.map(label => label.externalId)}
      />
    </GeneralDetails>
  );
};
