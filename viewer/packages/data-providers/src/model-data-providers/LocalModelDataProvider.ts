/*!
 * Copyright 2021 Cognite AS
 */

import { Log } from '@reveal/logger';
import type { ModelDataProvider } from '../ModelDataProvider';
import { fetchWithStatusCheck } from '../utilities/fetchWithStatusCheck';

export class LocalModelDataProvider implements ModelDataProvider {
  async getBinaryFile(baseUrl: string, fileName: string, abortSignal?: AbortSignal): Promise<ArrayBuffer> {
    if (abortSignal) {
      Log.warn('Abort signal is not supported for local models');
    }
    const url = baseUrl !== '' ? `${baseUrl}/${fileName}` : fileName;
    const response = await fetchWithStatusCheck(url);
    return response.arrayBuffer();
  }

  async getJsonFile(baseUrl: string, fileName: string): Promise<any> {
    const url = baseUrl !== '' ? `${baseUrl}/${fileName}` : fileName;
    const response = await fetchWithStatusCheck(url);
    return response.json();
  }
}
