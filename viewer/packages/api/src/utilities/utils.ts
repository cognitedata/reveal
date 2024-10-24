/*!
 * Copyright 2024 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';
import { AddModelOptions, LocalAddModelOptions } from '../public/migration/types';
import { DataSourceType, fetchDMModelIdFromRevisionId, isDMIdentifier } from '@reveal/data-providers';
import { isClassicIdentifier, isLocalIdentifier } from '@reveal/data-providers/src/DataSourceType';
import { assertNever } from '@reveal/utilities';

export async function getModelAndRevisionId(
  options: AddModelOptions<DataSourceType> | LocalAddModelOptions,
  sdk: CogniteClient | undefined
): Promise<{ modelId: number; revisionId: number }> {
  if (isDMIdentifier(options)) {
    return fetchDMModelIdFromRevisionId(options.revisionExternalId, options.revisionSpace, sdk);
  } else if (isClassicIdentifier(options)) {
    return { modelId: options.modelId, revisionId: options.revisionId };
  } else if (isLocalIdentifier(options)) {
    return { modelId: -1, revisionId: -1 };
  } else {
    assertNever(options);
  }
}
