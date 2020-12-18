import React from 'react';
import { useParams } from 'react-router-dom';
import { PageTitle } from '@cognite/cdf-utilities';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { Asset } from '@cognite/sdk';
import { AssetPreview } from './AssetPreview';

export const AssetPage = () => {
  const { id: assetIdString } = useParams<{
    id: string;
  }>();

  const assetId = parseInt(assetIdString, 10);

  const { data: asset } = useCdfItem<Asset>(
    'assets',
    { id: assetId },
    {
      enabled: !!assetId,
    }
  );

  if (!assetIdString) {
    return null;
  }

  return (
    <>
      <PageTitle title={asset?.name} />
      <AssetPreview assetId={assetId} />
    </>
  );
};
