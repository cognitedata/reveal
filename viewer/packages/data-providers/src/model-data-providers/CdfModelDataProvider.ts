/*!
 * Copyright 2021 Cognite AS
 */
import type { CogniteClient, HttpRequestOptions } from '@cognite/sdk';
import type { ModelDataProvider } from '../ModelDataProvider';
import { DMModelIdentifier } from '../model-identifiers/DMModelIdentifier';
import type { DMSJsonFileItem, DMSJsonFileResponse } from '../types';
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
    return response.data;
  }

  public async getSignedBinaryFile(signedUrl: string, abortSignal?: AbortSignal): Promise<ArrayBuffer> {
    const headers = {
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

  public async getSignedJsonFile(signedUrl: string): Promise<unknown> {
    const headers = {
      Accept: 'application/json, */*'
    };
    const response = await this.fetchWithRetry(signedUrl, {
      headers,
      method: 'GET'
    }).catch(() => {
      throw Error('Could not download signed JSON file');
    });
    if (response.ok === false) {
      throw new Error(`Signed JSON file request failed with status ${response.status}`);
    }
    return response.json();
  }

  /**
   * Download and parse a JSON file through signed URL endpoint for a given model identifier.
   * @param baseUrl         Base URL of the signed files endpoint.
   * @param modelIdentifier DM model identifier containing revision info (required).
   */
  async getDMSJsonFile(baseUrl: string, modelIdentifier: DMModelIdentifier, fileName: string): Promise<unknown> {
    const [signedUrlItemsData, fileData] = await Promise.all([
      this.fetchDMSJsonFile(baseUrl, modelIdentifier),
      this.getDMSJsonFileFromFileName(baseUrl, modelIdentifier, fileName)
    ]);

    return {
      signedFiles: signedUrlItemsData,
      fileData
    };
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
    const fileResponse = await this.fetchDMSJsonFile(baseUrl, modelIdentifier, [fileName]);
    if (!fileResponse.items.length) {
      throw new Error(`File "${fileName}" not found via filtered request to signed files endpoint`);
    }
    return this.getSignedJsonFile(fileResponse.items[0].signedUrl);
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
