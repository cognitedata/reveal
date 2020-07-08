/*!
 * Copyright 2020 Cognite AS
 */

export interface MetadataRepository<Input, Output> {
  loadData(input: Input): Output;
}
