/*!
 * Copyright 2021 Cognite AS
 */

export interface MetadataRepository<Input, Output> {
  loadData(input: Input): Output;
}
