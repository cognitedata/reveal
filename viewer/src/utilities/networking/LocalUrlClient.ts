/*!
 * Copyright 2020 Cognite AS
 */

import { HttpHeadersProvider } from './HttpHeadersProvider';
import { ModelUrlProvider, JsonFileProvider, BinaryFileProvider } from './types';
import { fetchWithStatusCheck } from './utilities';

export class LocalUrlClient
  implements ModelUrlProvider<{ fileName: string }>, HttpHeadersProvider, JsonFileProvider, BinaryFileProvider {
  getModelUrl(params: { fileName: string }): Promise<string> {
    return Promise.resolve(`${location.origin}/${params.fileName}`);
  }

  get headers() {
    return {};
  }

  async getBinaryFile(blobUrl: string, fileName: string): Promise<ArrayBuffer> {
    const response = await fetchWithStatusCheck(`${blobUrl}/${fileName}`);
    return response.arrayBuffer();
  }

  async getJsonFile(blobUrl: string, fileName: string): Promise<any> {
    const response = await fetchWithStatusCheck(`${blobUrl}/${fileName}`);
    return response.json();
  }
}
