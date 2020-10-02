import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { trackUsage } from 'utils/Metrics';
import { AssetPreview } from './AssetPreview';

export const AssetPage = () => {
  const { assetId } = useParams<{
    assetId: string;
  }>();
  const assetIdNumber = parseInt(assetId, 10);

  useEffect(() => {
    trackUsage('Exploration.Asset', { assetId: assetIdNumber });
  }, [assetIdNumber]);

  return <AssetPreview assetId={assetIdNumber} />;
};
