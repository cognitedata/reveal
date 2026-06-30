/*!
 * Copyright 2021 Cognite AS
 */

import { Log } from '@reveal/logger';
import type { ModelDataProvider } from '../ModelDataProvider';
import { fetchWithStatusCheck } from '../utilities/fetchWithStatusCheck';
import type { DMModelIdentifier } from '../model-identifiers/DMModelIdentifier';
import type { DMSModelFilesBundle } from '../types';

export class LocalModelDataProvider implements ModelDataProvider {
  getBinaryFile(baseUrl: string, fileName: string, abortSignal?: AbortSignal): Promise<ArrayBuffer>;
  getBinaryFile(signedUrl: string, abortSignal?: AbortSignal): Promise<ArrayBuffer>;
  async getBinaryFile(
    baseOrSigned: string,
    fileNameOrSignal?: string | AbortSignal,
    _abortSignal?: AbortSignal
  ): Promise<ArrayBuffer> {
    Log.warn('Abort signal is not supported for local models');
    const url = typeof fileNameOrSignal === 'string' ? `${baseOrSigned}/${fileNameOrSignal}` : baseOrSigned;
    const response = await fetchWithStatusCheck(url);
    return response.arrayBuffer();
  }

  getJsonFile<T = unknown>(baseUrl: string, fileName: string): Promise<T>;
  getJsonFile<T = unknown>(signedUrl: string): Promise<T>;
  async getJsonFile<T = unknown>(baseOrSigned: string, fileName?: string): Promise<T> {
    const url = fileName !== undefined ? `${baseOrSigned}/${fileName}` : baseOrSigned;
    const response = await fetchWithStatusCheck(url);
    return response.json();
  }

  async getDMSJsonFile(
    baseUrl: string,
    _modelIdentifier: DMModelIdentifier,
    fileName: string
  ): Promise<DMSModelFilesBundle> {
    const response = await fetchWithStatusCheck(`${baseUrl}/${fileName}`);
    const fileData = await response.json();
    return { signedFiles: { items: [] }, fileData };
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
