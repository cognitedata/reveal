/*!
 * Copyright 2021 Cognite AS
 */

import { HttpHeaders } from '@cognite/sdk-core';
import { ModelDataProvider } from './types';
import { fetchWithStatusCheck } from './utilities';

export class LocalModelDataProvider implements ModelDataProvider {
  get headers(): HttpHeaders {
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
}
