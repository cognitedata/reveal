/*!
 * Copyright 2024 Cognite AS
 */

import type { CogniteClient } from '@cognite/sdk';
import type { AddModelOptions } from '../public/migration/types';
import type { DataSourceType } from '@reveal/data-providers';
import {
  extractNumericId,
  fetchDMModelIdFromRevisionId,
  isDMIdentifier,
  isClassicIdentifier,
  isLocalIdentifier
} from '@reveal/data-providers';
import { assertNever } from '@reveal/utilities';
import type { LocalAddModelOptions } from '../../../data-providers/src/utilities/internalAddModelOptions';

export async function getModelAndRevisionId(
  options: AddModelOptions<DataSourceType> | LocalAddModelOptions,
  sdk: CogniteClient | undefined
): Promise<{ modelId: number; revisionId: number }> {
  if (isDMIdentifier(options)) {
    // A caller that already resolved the classic ids passes them along with the data modeling ids, so the
    // lookup is skipped. The revision id is checked against the revision external id. The model id cannot be
    // checked without the lookup and is trusted, as it is for classic options.
    if (isClassicIdentifier(options) && extractNumericId(options.revisionExternalId) === options.revisionId) {
      return { modelId: options.modelId, revisionId: options.revisionId };
    }
    return fetchDMModelIdFromRevisionId(options.revisionExternalId, options.revisionSpace, sdk);
  } else if (isClassicIdentifier(options)) {
    return { modelId: options.modelId, revisionId: options.revisionId };
  } else if (isLocalIdentifier(options)) {
    return { modelId: -1, revisionId: -1 };
  } else {
    assertNever(options);
  }
}
