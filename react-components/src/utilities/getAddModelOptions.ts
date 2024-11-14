/*!
 * Copyright 2024 Cognite AS
 */

import { type AddModelOptions, type DataSourceType, type GeometryFilter } from '@cognite/reveal';
import { isClassicIdentifier, isDMIdentifier } from '../components';

type ModelOptions = {
  modelId?: number;
  revisionId?: number;
  revisionExternalId?: string;
  revisionSpace?: string;
  geometryFilter?: GeometryFilter;
};

export function getAddModelOptions(
  options: AddModelOptions<DataSourceType>
): ModelOptions | undefined {
  if (isClassicIdentifier(options)) {
    return {
      modelId: options.modelId,
      revisionId: options.revisionId,
      geometryFilter: options.geometryFilter
    };
  } else if (isDMIdentifier(options)) {
    return {
      revisionExternalId: options.revisionExternalId,
      revisionSpace: options.revisionSpace,
      geometryFilter: options.geometryFilter
    };
  } else {
    return undefined;
  }
}
