/*!
 * Copyright 2021 Cognite AS
 */

import { ModelDataClient } from './types';
import { fetchWithStatusCheck } from './utilities';

export class LocalModelDataClient implements ModelDataClient {
  get headers() {
    return {};
  }

  async getBinaryFile(baseUrl: string, fileName: string): Promise<ArrayBuffer> {
    const response = await fetchWithStatusCheck(`${baseUrl}/${fileName}`);
    return response.arrayBuffer();
  }

  async getJsonFile(baseUrl: string, fileName: string): Promise<any> {
    const response = await fetchWithStatusCheck(`${baseUrl}/${fileName}`);
    return response.json();
  }

  getApplicationIdentifier(): string {
    return 'LocalClient';
  }
}
