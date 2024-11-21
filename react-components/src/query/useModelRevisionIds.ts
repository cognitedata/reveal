/*!
 * Copyright 2024 Cognite AS
 */
import { useMemo } from 'react';
import { use3dModels } from '../hooks';
import { type ModelRevisionId } from '../components/CacheProvider/types';
import { CognitePointCloudModel, type DataSourceType, isDMPointCloudModel } from '@cognite/reveal';
import { isClassicIdentifier, isDMIdentifier } from '../components';

export type ModelRevisionIdAndType = ModelRevisionId & { type: 'cad' | 'pointcloud' };

export const useModelRevisionIds = (): ModelRevisionIdAndType[] => {
  const viewerModels = use3dModels();

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
    dmModels.forEach((model) => {
      if (isClassicIdentifier(model.modelIdentifier)) {
        modelRevisionIds.push({
          modelId: model.modelIdentifier.modelId,
          revisionId: model.modelIdentifier.revisionId,
          type: model.type
        });
      } else if (
        isDMIdentifier(model.modelIdentifier) &&
        'classicModelRevisionId' in model.modelIdentifier
      ) {
        const classicModelRevisionId = model.modelIdentifier.classicModelRevisionId;
        if (
          typeof classicModelRevisionId === 'object' &&
          classicModelRevisionId !== null &&
          'modelId' in classicModelRevisionId &&
          'revisionId' in classicModelRevisionId
        ) {
          modelRevisionIds.push({
            modelId: classicModelRevisionId.modelId as number,
            revisionId: classicModelRevisionId.revisionId as number,
            type: model.type
          });
        }
      }
    });
    return modelRevisionIds;
  }, [dmModels]);
  return modelRevisionIds;
};
