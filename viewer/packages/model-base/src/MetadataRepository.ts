/*!
 * Copyright 2021 Cognite AS
 */

import { ModelIdentifier } from '@reveal/data-providers';

export type MetadataRepository<Output> = {
  loadData(modelIdentifier: ModelIdentifier): Output;
};
