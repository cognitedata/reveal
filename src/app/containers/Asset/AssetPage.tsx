import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { trackUsage } from 'app/utils/Metrics';
import { AssetPreview } from './AssetPreview';

export const AssetPage = () => {
  const { id: assetIdString } = useParams<{
    id: string;
  }>();

  const assetId = parseInt(assetIdString, 10);

  useEffect(() => {
    trackUsage('Exploration.AssetPage', { assetId });
  }, [assetId]);

  if (!assetIdString) {
    return null;
  }

  return (
    <AssetPreview
      assetId={assetId}
      actions={['Download', 'Collections', 'Copy']}
    />
  );
};
