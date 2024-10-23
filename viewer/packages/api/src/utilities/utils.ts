/*!
 * Copyright 2024 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';
import { AddModelOptions, DMAddModelOptions } from '../public/migration/types';
import { DataSourceType, fetchDMModelIdFromRevisionId } from '@reveal/data-providers';

export function isAddDMModelOptions(options: AddModelOptions<DataSourceType>): options is DMAddModelOptions {
  return (
    (options as DMAddModelOptions).revisionExternalId !== undefined &&
    (options as DMAddModelOptions).revisionSpace !== undefined
  );
}

export async function getModelAndRevisionId(
  options: AddModelOptions<DataSourceType>,
  sdk: CogniteClient | undefined
): Promise<{ modelId: number; revisionId: number }> {
  if (isAddDMModelOptions(options)) {
    return fetchDMModelIdFromRevisionId(options.revisionExternalId, options.revisionSpace, sdk);
  } else {
    return { modelId: options.modelId, revisionId: options.revisionId };
  }
}
