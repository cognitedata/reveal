/*!
 * Copyright 2024 Cognite AS
 */
import { useMemo } from 'react';
import { use3dModels } from '../hooks';
import { type ModelRevisionId } from '../components/CacheProvider/types';
import { CognitePointCloudModel, type DataSourceType, isDMPointCloudModel } from '@cognite/reveal';
import { isClassicIdentifier, isDMIdentifier } from '../components';
import { getModelIdAndRevisionIdFromExternalId } from '../hooks/network/getModelIdAndRevisionIdFromExternalId';
import { useFdmSdk } from '../components/RevealCanvas/SDKProvider';

export type ModelRevisionIdAndType = ModelRevisionId & { type: 'cad' | 'pointcloud' };

export const useModelRevisionIds = (): ModelRevisionIdAndType[] => {
  const viewerModels = use3dModels();
  const fdmSdk = useFdmSdk();

  const dmModels: Array<CognitePointCloudModel<DataSourceType>> = useMemo(() => {
    return viewerModels.filter(
      (model): model is CognitePointCloudModel<DataSourceType> =>
        model instanceof CognitePointCloudModel &&
        model.type === 'pointcloud' &&
        isDMPointCloudModel(model)
    );
  }, [viewerModels]);

  const modelRevisionIds: ModelRevisionIdAndType[] = useMemo(() => {
    if (dmModels.length === 0) {
      return [];
    }
    const modelRevisionIds: ModelRevisionIdAndType[] = [];
    dmModels.forEach(async (model) => {
      if (isClassicIdentifier(model.modelIdentifier)) {
        modelRevisionIds.push({
          modelId: model.modelIdentifier.modelId,
          revisionId: model.modelIdentifier.revisionId,
          type: model.type
        });
      } else if (isDMIdentifier(model.modelIdentifier)) {
        const { modelId, revisionId } = await getModelIdAndRevisionIdFromExternalId(
          model.modelIdentifier.revisionExternalId,
          model.modelIdentifier.revisionSpace,
          fdmSdk
        );

        modelRevisionIds.push({
          modelId,
          revisionId,
          type: model.type
        });
      }
    });
    return modelRevisionIds;
  }, [dmModels]);
  return modelRevisionIds;
};
