/*!
 * Copyright 2021 Cognite AS
 */
import { CogniteClient, HttpRequestOptions } from '@cognite/sdk';
import { ModelDataProvider } from '../ModelDataProvider';
import { isDMIdentifier } from '../DataSourceType';
import { CdfModelIdentifier } from '../model-identifiers/CdfModelIdentifier';
import { DMModelIdentifier } from '../model-identifiers/DMModelIdentifier';
import { DMSJsonFileItem, DMSJsonFileResponse } from '../types';

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

  public async getBinaryFile(baseUrl: string, fileName: string, abortSignal?: AbortSignal): Promise<ArrayBuffer> {
    const url = `${baseUrl}/${fileName}`;
    const headers = {
      ...this.client.getDefaultRequestHeaders(),
      Accept: '*/*'
    };

    const response = await this.fetchWithRetry(url, {
      headers,
      signal: abortSignal,
      method: 'GET'
    }).catch(e => {
      if (e?.name === 'AbortError') {
        throw e;
      }
      throw Error('Could not download binary file');
    });
    return response.arrayBuffer();
  }

  async getJsonFile(baseUrl: string, fileName: string): Promise<unknown> {
    const response = await this.client.get(`${baseUrl}/${fileName}`).catch(_err => {
      throw Error('Could not download Json file');
    });
    return {
      signedFiles: { items: [] },
      fileData: response.data
    };
  }

  public async getSignedBinaryFile(signedUrl: string, abortSignal?: AbortSignal): Promise<ArrayBuffer> {
    const headers = {
      ...this.client.getDefaultRequestHeaders(),
      Accept: '*/*'
    };

    const response = await this.fetchWithRetry(signedUrl, {
      headers,
      signal: abortSignal,
      method: 'GET'
    }).catch(e => {
      if (e?.name === 'AbortError') {
        throw e;
      }
      throw Error('Could not download signed binary file');
    });
    return response.arrayBuffer();
  }

  /**
   * Download and parse a JSON file through signed URL endpoint for a given model identifier.
   * @param baseUrl         Base URL of the signed files endpoint.
   * @param modelIdentifier DM model identifier containing revision info (required).
   */
  async getDMSJsonFile(baseUrl: string, modelIdentifier: DMModelIdentifier, fileName: string): Promise<unknown> {
    const signedUrlItemsData = await this.getDMSJsonFileFromModelIdentifier(baseUrl, modelIdentifier);
    const fileData = await this.getDMSJsonFileFromFileName(baseUrl, modelIdentifier, fileName);

    console.log('TEST signedUrlItemsData', signedUrlItemsData);
    console.log('TEST fileData', fileData);
    return {
      signedFiles: signedUrlItemsData,
      fileData
    };
  }

  /**
   * Download and parse a JSON file through signed URL endpoint for a given model identifier.
   * @param baseUrl         Base URL of the signed files endpoint.
   * @param modelIdentifier DM model identifier containing revision info (required).
   */
  async getDMSJsonFileFromModelIdentifier(
    baseUrl: string,
    modelIdentifier: DMModelIdentifier
  ): Promise<DMSJsonFileResponse> {
    return this.fetchDMSJsonFile(baseUrl, modelIdentifier);
  }

  /**
   * Download and parse a JSON file through signed URL endpoint for a given file name.
   * @param baseUrl         Base URL of the signed files endpoint.
   * @param modelIdentifier DM model identifier containing revision info (required).
   * @param fileName        Filename to filter by specific file path.
   */
  async getDMSJsonFileFromFileName(
    baseUrl: string,
    modelIdentifier: DMModelIdentifier,
    fileName: string
  ): Promise<unknown> {
    const fileResponse = await this.fetchDMSJsonFile(baseUrl, modelIdentifier, fileName);
    const fileNameData = await this.fetchWithRetry(fileResponse.items[0].signedUrl, {
      headers: { Accept: '*/*' },
      method: 'GET'
    });
    return fileNameData.json();
  }

  /**
   * Download and parse a JSON file through signed URL endpoint.
   * @param baseUrl         Base URL of the signed files endpoint.
   * @param modelIdentifier DM model identifier containing revision info (required).
   * @param fileName        Optional filename to filter by specific file path.
   */
  async fetchDMSJsonFile(
    baseUrl: string,
    modelIdentifier: DMModelIdentifier,
    fileName?: string
  ): Promise<DMSJsonFileResponse> {
    if (!(modelIdentifier instanceof CdfModelIdentifier && isDMIdentifier(modelIdentifier))) {
      throw new Error('getDMSJsonFile requires a valid DM model identifier');
    }

    const items: DMSJsonFileItem[] = [];
    let cursor: string | undefined = undefined;

    const filter = fileName ? { filter: { paths: [fileName] } } : undefined;
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
      items.push(...responseData.items);
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
