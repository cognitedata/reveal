import React, { useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { retrieve as retrieveAsset } from '@cognite/cdf-resources-store/dist/assets';
import { useResourcesDispatch } from '@cognite/cdf-resources-store';
import { trackUsage } from 'utils/Metrics';
import { Loader } from 'components/Common';
import ResourceSelectionContext from 'context/ResourceSelectionContext';
import { useResourcePreview } from 'context/ResourcePreviewContext';
import { AssetPreview } from './AssetPreview';

export const AssetPage = () => {
  const dispatch = useResourcesDispatch();
  const { assetId } = useParams<{
    assetId: string | undefined;
  }>();
  const assetIdNumber = assetId ? parseInt(assetId, 10) : undefined;
  const { hidePreview } = useResourcePreview();
  useEffect(() => {
    trackUsage('Exploration.Asset', { assetId: assetIdNumber });
  }, [assetIdNumber]);

  const { resourcesState, setResourcesState } = useContext(
    ResourceSelectionContext
  );
  const isActive = resourcesState.some(
    el =>
      el.state === 'active' && el.id === assetIdNumber && el.type === 'asset'
  );

  useEffect(() => {
    if (assetIdNumber && !isActive) {
      setResourcesState(
        resourcesState
          .filter(el => el.state !== 'active')
          .concat([{ id: assetIdNumber, type: 'asset', state: 'active' }])
      );
    }
  }, [isActive, resourcesState, assetIdNumber, setResourcesState]);

  useEffect(() => {
    if (assetIdNumber) {
      (async () => {
        await dispatch(retrieveAsset([{ id: assetIdNumber }]));
      })();
    }
    hidePreview();
  }, [dispatch, assetIdNumber, hidePreview]);

  if (!assetIdNumber) {
    return <Loader />;
  }
  return <AssetPreview assetId={assetIdNumber} />;
};
