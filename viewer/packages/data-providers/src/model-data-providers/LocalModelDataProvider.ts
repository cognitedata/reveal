/*!
 * Copyright 2021 Cognite AS
 */

import { Log } from '@reveal/logger';
import { ModelDataProvider } from '../ModelDataProvider';
import { fetchWithStatusCheck } from '../utilities/fetchWithStatusCheck';

export class LocalModelDataProvider implements ModelDataProvider {
  async getBinaryFile(baseUrl: string, fileName: string, abortSignal?: AbortSignal): Promise<ArrayBuffer> {
    if (abortSignal) {
      Log.warn('Abort signal is not supported for local models');
    }
    const response = await fetchWithStatusCheck(`${baseUrl}/${fileName}`);
    return response.arrayBuffer();
  }

  async getJsonFile(baseUrl: string, fileName: string): Promise<any> {
    const response = await fetchWithStatusCheck(`${baseUrl}/${fileName}`);
    return response.json();
  }
}
