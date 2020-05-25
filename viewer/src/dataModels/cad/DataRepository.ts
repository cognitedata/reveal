/*!
 * Copyright 2020 Cognite AS
 */

export interface DataRepository<Input, Output> {
  loadData(input: Input): Output;
}
