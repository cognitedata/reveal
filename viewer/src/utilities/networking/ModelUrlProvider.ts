/*!
 * Copyright 2020 Cognite AS
 */

export interface ModelUrlProvider<Params> {
  getModelUrl(params: Params): Promise<string>;
}
