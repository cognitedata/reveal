/*!
 * Copyright 2020 Cognite AS
 */

export interface ModelDataRetriever {
  fetchJson(filename: string): Promise<any>;
  fetchData(filename: string): Promise<ArrayBuffer>;
}
