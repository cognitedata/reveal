/*!
 * Copyright 2021 Cognite AS
 */

import type { ModelIdentifier } from '@reveal/data-providers';

export interface MetadataRepository<Output> {
  loadData(modelIdentifier: ModelIdentifier): Output;
}
