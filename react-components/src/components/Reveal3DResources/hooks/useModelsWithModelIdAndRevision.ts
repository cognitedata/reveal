/*!
 * Copyright 2024 Cognite AS
 */

import { type AddModelOptions, type ClassicDataSourceType } from '@cognite/reveal';
import { useMemo } from 'react';
import {
  type PointCloudModelOptions,
  type CadOrPointCloudModelWithModelIdRevisionId
} from '../types';

export function useModelsWithModelIdAndRevision(
  models: PointCloudModelOptions[],
  classicModelOptions: Array<AddModelOptions<ClassicDataSourceType>>
): CadOrPointCloudModelWithModelIdRevisionId[] {
  return useMemo(() => {
    return classicModelOptions.map((model, index) => ({
      modelOptions: models[index],
      ...model
    }));
  }, [classicModelOptions, models]);
}
