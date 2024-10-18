/*!
 * Copyright 2024 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';
import { AddCdfModelOptions, AddDMModelOptions } from '../public/migration/types';

function isAddDMModelOptions(options: AddCdfModelOptions): options is AddDMModelOptions {
  return (
    (options as AddDMModelOptions).revisionExternalId !== undefined &&
    (options as AddDMModelOptions).space !== undefined
  );
}

export async function getModelAndRevisionId(
  options: AddCdfModelOptions,
  fetchDMModelIdFromRevisionId: (
    revisionExternalId: string,
    space: string,
    sdk: CogniteClient | undefined
  ) => Promise<{ modelId: number; revisionId: number }>,
  sdk: CogniteClient | undefined
): Promise<{ modelId: number; revisionId: number }> {
  if (isAddDMModelOptions(options)) {
    return fetchDMModelIdFromRevisionId(options.revisionExternalId, options.space, sdk);
  } else {
    return { modelId: options.modelId, revisionId: options.revisionId };
  }
}
