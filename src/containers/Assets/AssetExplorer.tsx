import React, { useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { retrieve as retrieveFile } from 'modules/files';
import { useDispatch } from 'react-redux';
import { listByFileId } from 'modules/annotations';
import { trackUsage } from 'utils/Metrics';
import { Loader } from 'components/Common';
import ResourceSelectionContext from 'context/ResourceSelectionContext';
import { AssetPreview } from './AssetPreview';

export const AssetExplorer = () => {
  const dispatch = useDispatch();
  const { assetId } = useParams<{
    assetId: string | undefined;
  }>();
  const assetIdNumber = assetId ? parseInt(assetId, 10) : undefined;

  useEffect(() => {
    trackUsage('Exploration.Asset', { assetId: assetIdNumber });
  }, [assetIdNumber]);

  const { resourcesState, setResourcesState } = useContext(
    ResourceSelectionContext
  );
  const isActive = resourcesState.some(
    el =>
      el.state === 'active' && el.id === assetIdNumber && el.type === 'assets'
  );

  useEffect(() => {
    if (assetIdNumber && !isActive) {
      setResourcesState(
        resourcesState
          .filter(el => el.state !== 'active')
          .concat([{ id: assetIdNumber, type: 'assets', state: 'active' }])
      );
    }
  }, [isActive, resourcesState, assetIdNumber, setResourcesState]);

  useEffect(() => {
    if (assetIdNumber) {
      (async () => {
        await dispatch(retrieveFile([{ id: assetIdNumber }]));
        await dispatch(listByFileId(assetIdNumber));
      })();
    }
  }, [dispatch, assetIdNumber]);

  if (!assetIdNumber) {
    return <Loader />;
  }
  return <AssetPreview assetId={assetIdNumber} />;
};
