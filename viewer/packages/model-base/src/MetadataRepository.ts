/*!
 * Copyright 2021 Cognite AS
 */

import { ModelIdentifier } from '@reveal/modeldata-api';

export interface MetadataRepository<Output> {
  loadData(modelIdentifier: ModelIdentifier): Output;
}
