import React from 'react';
import { useParams } from 'react-router-dom';
import { AssetPreview } from './AssetPreview';

export const AssetPage = () => {
  const { id: assetIdString } = useParams<{
    id: string;
  }>();

  const assetId = parseInt(assetIdString, 10);

  if (!assetIdString) {
    return null;
  }

  return <AssetPreview assetId={assetId} />;
};
