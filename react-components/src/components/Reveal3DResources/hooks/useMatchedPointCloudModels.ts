/*!
 * Copyright 2024 Cognite AS
 */

import {
  type CognitePointCloudModel,
  type DataSourceType,
  isDMPointCloudModel,
  isClassicPointCloudModel
} from '@cognite/reveal';
import { useMemo } from 'react';
import { EMPTY_ARRAY } from '../../../utilities/constants';
import { isDMIdentifier } from '../typeGuards';
import { type CadOrPointCloudModelWithModelIdRevisionId } from '../types';

type MatchedPointCloudModel = {
  viewerModel: CognitePointCloudModel<DataSourceType>;
  model: CadOrPointCloudModelWithModelIdRevisionId;
};

export function useMatchedPointCloudModels(
  viewerModels: Array<CognitePointCloudModel<DataSourceType>>,
  modelsWithModelIdAndRevision: CadOrPointCloudModelWithModelIdRevisionId[]
): MatchedPointCloudModel[] {
  return useMemo(() => {
    return viewerModels.flatMap((viewerModel) => {
      if (viewerModel.type !== 'pointcloud') {
        return EMPTY_ARRAY;
      }
      const model = viewerModel;
      const matchedModel = modelsWithModelIdAndRevision.find((modelData) => {
        if (isDMPointCloudModel(model) && isDMIdentifier(modelData)) {
          return (
            model.modelIdentifier.revisionExternalId === modelData.revisionExternalId &&
            model.modelIdentifier.revisionSpace === modelData.revisionSpace
          );
        } else if (isClassicPointCloudModel(model)) {
          return (
            model.modelIdentifier.modelId === modelData.modelId &&
            model.modelIdentifier.revisionId === modelData.revisionId
          );
        }
        return false;
      });
      return matchedModel !== undefined ? [{ viewerModel, model: matchedModel }] : EMPTY_ARRAY;
    });
  }, [viewerModels, modelsWithModelIdAndRevision]);
}
