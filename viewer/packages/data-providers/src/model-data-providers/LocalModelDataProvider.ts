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

  async getSignedBinaryFile(signedUrl: string, abortSignal?: AbortSignal): Promise<ArrayBuffer> {
    if (abortSignal) {
      Log.warn('Abort signal is not supported for local models');
    }
    const response = await fetchWithStatusCheck(signedUrl);
    return response.arrayBuffer();
  }

  async getJsonFile(baseUrl: string, fileName: string): Promise<any> {
    const response = await fetchWithStatusCheck(`${baseUrl}/${fileName}`);
    return response.json();
  }

  /**
   * Download and parse a JSON file. For local models, this simply fetches from baseUrl/fileName.
   * @param baseUrl         Base URL of the model.
   * @param _modelIdentifier Model identifier (ignored for local models).
   * @param fileName        Filename to fetch (required for local models).
   */
  async getDMSJsonFile<T>(baseUrl: string, _modelIdentifier: DMModelIdentifier, fileName?: string): Promise<T> {
    if (!fileName) {
      throw new Error('LocalModelDataProvider requires a fileName to fetch JSON files');
    }
    const response = await fetchWithStatusCheck(`${baseUrl}/${fileName}`);
    return response.json();
  }
  /**
   * Download and parse a JSON file through signed URL endpoint for a given file name.
   * @param baseUrl         Base URL of the signed files endpoint.
   * @param _modelIdentifier DM model identifier containing revision info (ignored for local models).
   * @param fileName        Filename to filter by specific file path.
   */
  async getDMSJsonFileFromFileName(
    baseUrl: string,
    _modelIdentifier: DMModelIdentifier,
    fileName: string
  ): Promise<unknown> {
    const response = await fetchWithStatusCheck(`${baseUrl}/${fileName}`);
    return response.json();
  }
}
