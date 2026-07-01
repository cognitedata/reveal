/*!
 * Copyright 2021 Cognite AS
 */
import type { CogniteClient, HttpRequestOptions } from '@cognite/sdk';
import type { ModelDataProvider } from '../ModelDataProvider';
import { DMModelIdentifier } from '../model-identifiers/DMModelIdentifier';
import type { DMSJsonFileItem, DMSJsonFileResponse, DMSModelFilesBundle } from '../types';
import { stripRestrictedApiGateway } from '../utilities/signedUrlUtils';

/**
 * Provides 3D V2 specific extensions for the standard CogniteClient used by Reveal.
 */
export class CdfModelDataProvider implements ModelDataProvider {
  private readonly client: CogniteClient;
  private authenticationPromise: Promise<string | undefined>;

  constructor(client: CogniteClient) {
    this.client = client;
    this.authenticationPromise = client.authenticate();
  }

  public getBinaryFile(baseUrl: string, fileName: string, abortSignal?: AbortSignal): Promise<ArrayBuffer>;
  public getBinaryFile(signedUrl: string, abortSignal?: AbortSignal): Promise<ArrayBuffer>;
  public async getBinaryFile(
    baseOrSigned: string,
    fileNameOrSignal?: string | AbortSignal,
    abortSignal?: AbortSignal
  ): Promise<ArrayBuffer> {
    const isStandard = typeof fileNameOrSignal === 'string';
    const url = isStandard ? `${baseOrSigned}/${fileNameOrSignal}` : baseOrSigned;
    const signal = isStandard ? abortSignal : (fileNameOrSignal as AbortSignal | undefined);
    const headers = {
      ...(isStandard ? this.client.getDefaultRequestHeaders() : {}),
      Accept: '*/*'
    };

    const response = await this.fetchWithRetry(url, {
      headers,
      signal,
      method: 'GET'
    }).catch(e => {
      if (e?.name === 'AbortError') {
        throw e;
      }
      throw new Error(isStandard ? 'Could not download binary file' : 'Could not download signed binary file');
    });
    return response.arrayBuffer();
  }

  getJsonFile<T = unknown>(baseUrl: string, fileName: string): Promise<T>;
  getJsonFile<T = unknown>(signedUrl: string): Promise<T>;
  async getJsonFile<T = unknown>(baseOrSigned: string, fileName?: string): Promise<T> {
    if (fileName !== undefined) {
      const response = await this.client.get<T>(`${baseOrSigned}/${fileName}`).catch(_err => {
        throw Error('Could not download Json file');
      });
      return response.data;
    }
    const headers = { Accept: 'application/json, */*' };
    const response = await this.fetchWithRetry(baseOrSigned, { headers, method: 'GET' }).catch(() => {
      throw Error('Could not download signed JSON file');
    });
    if (response.ok === false) {
      throw new Error(`Signed JSON file request failed with status ${response.status}`);
    }
    return response.json();
  }

  async getDMSJsonFile(
    baseUrl: string,
    modelIdentifier: DMModelIdentifier,
    fileName: string
  ): Promise<DMSModelFilesBundle> {
    const signedFiles = await this.fetchDMSJsonFile(baseUrl, modelIdentifier);
    const found = signedFiles.items.find(item => item.fileName === fileName || item.fileName.endsWith('/' + fileName));

    if (!found) {
      throw new Error(`File "${fileName}" not found in signed files response`);
    }
    const fileData = await this.getJsonFile(found.signedUrl);
    return { signedFiles, fileData };
  }

  private async fetchDMSJsonFile(
    baseUrl: string,
    modelIdentifier: DMModelIdentifier,
    fileNames?: string[]
  ): Promise<DMSJsonFileResponse> {
    if (!(modelIdentifier instanceof DMModelIdentifier)) {
      throw new Error('getDMSJsonFile requires a valid DM model identifier');
    }

    const items: DMSJsonFileItem[] = [];
    let cursor: string | undefined = undefined;

    const filter = fileNames?.length ? { filter: { paths: fileNames } } : undefined;
    do {
      const payload: HttpRequestOptions = {
        data: {
          revision: {
            instanceId: {
              space: modelIdentifier.revisionSpace,
              externalId: modelIdentifier.revisionExternalId
            }
          },
          ...filter,
          limit: 1000,
          cursor: cursor
        }
      };

      const response = await this.client.post<DMSJsonFileResponse>(`${baseUrl}`, payload);
      const responseData = response.data;
      items.push(
        ...responseData.items.map(item => ({ ...item, signedUrl: stripRestrictedApiGateway(item.signedUrl) }))
      );
      cursor = responseData.nextCursor;
    } while (cursor);

    return { items, nextCursor: cursor };
  }

  private async fetchWithRetry(input: RequestInfo, options: RequestInit, retries: number = 3) {
    let error: Error | undefined;
    for (let i = 0; i < retries; i++) {
      try {
        await this.authenticationPromise;

        const response = await fetch(input, options);

        // Authentication error
        if (response.status === 401) {
          this.authenticationPromise = this.client.authenticate();
          continue;
        }

        return response;
      } catch (e) {
        // Keep first error only
        if (error === undefined) {
          error = e as Error;

          //Stop retries if the request has been aborted
          if (error.name === 'AbortError') {
            throw error;
          }
        }
      }
    }
    throw error;
  }
}
