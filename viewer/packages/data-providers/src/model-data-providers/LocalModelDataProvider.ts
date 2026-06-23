/*!
 * Copyright 2021 Cognite AS
 */

import { Log } from '@reveal/logger';
import type { ModelDataProvider } from '../ModelDataProvider';
import { fetchWithStatusCheck } from '../utilities/fetchWithStatusCheck';
import type { DMModelIdentifier } from '../model-identifiers/DMModelIdentifier';

export class LocalModelDataProvider implements ModelDataProvider {
  async getBinaryFile(baseUrl: string, fileName: string, abortSignal?: AbortSignal): Promise<ArrayBuffer> {
    if (abortSignal) {
      Log.warn('Abort signal is not supported for local models');
    }
    const response = await fetchWithStatusCheck(`${baseUrl}/${fileName}`);
    return response.arrayBuffer();
  }

  async getSignedBinaryFile(signedUrl: string, abortSignal?: AbortSignal): Promise<ArrayBuffer> {
    if (abortSignal) {
      Log.warn('Abort signal is not supported for local models');
    }
    const response = await fetchWithStatusCheck(signedUrl);
    return response.arrayBuffer();
  }

  async getSignedJsonFile(signedUrl: string): Promise<unknown> {
    const response = await fetchWithStatusCheck(signedUrl);
    return response.json();
  }

  async getJsonFile(baseUrl: string, fileName: string): Promise<unknown> {
    const response = await fetchWithStatusCheck(`${baseUrl}/${fileName}`);
    return response.json();
  }

  async getDMSJsonFile(baseUrl: string, _modelIdentifier: DMModelIdentifier, fileName: string): Promise<unknown> {
    const response = await fetchWithStatusCheck(`${baseUrl}/${fileName}`);
    return response.json();
  }

  async getDMSJsonFileFromFileName(
    baseUrl: string,
    _modelIdentifier: DMModelIdentifier,
    fileName: string
  ): Promise<unknown> {
    const response = await fetchWithStatusCheck(`${baseUrl}/${fileName}`);
    return response.json();
  }
}
