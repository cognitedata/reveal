import React from 'react';
import { Asset } from '@cognite/sdk';
import {
  TimeDisplay,
  GeneralDetails,
} from '@data-exploration-components/components';
import { useDetailedMappingsByAssetIdQuery } from '@data-exploration-lib/domain-layer';

type Props = {
  asset: Asset;
};

export const AssetDetails = ({ asset }: Props) => {
  const { data: mappings, isFetched } = useDetailedMappingsByAssetIdQuery(
    asset.id
  );

  return (
    <GeneralDetails>
      <GeneralDetails.Item
        key={asset.name}
        name="Name"
        value={asset.name}
        copyable
      />
      <GeneralDetails.Item name="Description" value={asset.description} />
      <GeneralDetails.Item key={asset.id} name="ID" value={asset.id} copyable />
      <GeneralDetails.Item
        name="External ID"
        key={asset.externalId}
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
      {isFetched && !!mappings?.length && (
        <GeneralDetails.ThreeDModelItem
          assetId={asset.id}
          mappings={mappings}
        />
      )}
      <GeneralDetails.LabelsItem
        labels={asset.labels?.map((label) => label.externalId)}
      />
      <GeneralDetails.Item
        name="Source"
        key={asset.source}
        value={asset.source}
        copyable
      />
    </GeneralDetails>
  );
};
