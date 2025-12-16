/*!
 * Copyright 2021 Cognite AS
 */

import { Log } from '@reveal/logger';
import { ModelDataProvider } from '../ModelDataProvider';
import { fetchWithStatusCheck } from '../utilities/fetchWithStatusCheck';
import { DMModelIdentifier } from '../model-identifiers/DMModelIdentifier';

export class LocalModelDataProvider implements ModelDataProvider {
  async getBinaryFile(baseUrl: string, fileName: string, abortSignal?: AbortSignal): Promise<ArrayBuffer> {
    if (abortSignal) {
      Log.warn('Abort signal is not supported for local models');
    }
    const response = await fetchWithStatusCheck(`${baseUrl}/${fileName}`);
    return response.arrayBuffer();
  }

  async getSignedBinaryFiles(
    baseUrl: string,
    fileNames: string[],
    modelIdentifier?: DMModelIdentifier,
    abortSignal?: AbortSignal
  ): Promise<ArrayBuffer[]> {
    if (abortSignal) {
      Log.warn('Abort signal is not supported for local models');
    }
    const arrayBuffers: ArrayBuffer[] = [];
    for (const fileName of fileNames) {
      const response = await fetchWithStatusCheck(`${baseUrl}/${fileName}`);
      const arrayBuffer = await response.arrayBuffer();
      arrayBuffers.push(arrayBuffer);
    }
    return arrayBuffers;
  }
  async getJsonFile(baseUrl: string, fileName: string): Promise<any> {
    const response = await fetchWithStatusCheck(`${baseUrl}/${fileName}`);
    return response.json();
  }

  async getDMSJsonFile(baseUrl: string, fileName: string, modelIdentifier?: DMModelIdentifier): Promise<unknown> {
    const response = await fetchWithStatusCheck(`${baseUrl}/${fileName}`);
    return response.json();
  }
}
