/*!
 * Copyright 2021 Cognite AS
 */

import { ModelDataProvider } from './types';
import { fetchWithStatusCheck } from './utilities';

export class LocalModelDataProvider implements ModelDataProvider {
  async getBinaryFile(baseUrl: string, fileName: string): Promise<ArrayBuffer> {
    const response = await fetchWithStatusCheck(`${baseUrl}/${fileName}`);
    return response.arrayBuffer();
  }

  async getJsonFile(baseUrl: string, fileName: string): Promise<any> {
    const response = await fetchWithStatusCheck(`${baseUrl}/${fileName}`);
    return response.json();
  }
}
