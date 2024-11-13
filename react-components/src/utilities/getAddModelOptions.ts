/*!
 * Copyright 2024 Cognite AS
 */

import { type AddModelOptions, type DataSourceType, type GeometryFilter } from '@cognite/reveal';
import { type CadModelOptions } from '../components';
import { type ModelRevisionId } from '../components/CacheProvider/types';
import { isDefined } from './isDefined';

export type ModelOptions = {
  modelId?: number;
  revisionId?: number;
  revisionExternalId?: string;
  revisionSpace?: string;
  geometryFilter?: GeometryFilter;
};

export function getAddModelOptions(
  options: AddModelOptions<DataSourceType>
): ModelOptions | undefined {
  if ('modelId' in options && 'revisionId' in options) {
    const { modelId, revisionId, geometryFilter } = options as {
      modelId: number;
      revisionId: number;
      geometryFilter?: GeometryFilter;
    };
    return { modelId, revisionId, geometryFilter };
  } else if ('revisionExternalId' in options && 'revisionSpace' in options) {
    const { revisionExternalId, revisionSpace, geometryFilter } = options as {
      revisionExternalId: string;
      revisionSpace: string;
      geometryFilter?: GeometryFilter;
    };
    return { revisionExternalId, revisionSpace, geometryFilter };
  } else {
    return undefined;
  }
}

export function getModelIdRevisionId(models: CadModelOptions[]): ModelRevisionId[] {
  return models
    .map((model) => {
      if ('modelId' in model && 'revisionId' in model) {
        const { modelId, revisionId } = model as {
          modelId: number;
          revisionId: number;
        };
        return { modelId, revisionId };
      }
      return undefined;
    })
    .filter(isDefined);
}
