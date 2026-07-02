/*!
 * Copyright 2021 Cognite AS
 */
import type { CogniteClient, HttpRequestOptions } from '@cognite/sdk';
import type { ModelDataProvider } from '../ModelDataProvider';
import { DMModelIdentifier } from '../model-identifiers/DMModelIdentifier';
import type { SignedFileItem, SignedFilesResponse, SignedFilesResponseWithFileData } from '../types';
import { stripRestrictedApiGateway } from '../utilities/signedUrlUtils';
import type { ModelIdentifier } from '../ModelIdentifier';

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
    const url = baseUrl ? `${baseUrl}/${fileName}` : fileName;
    const headers = {
      ...(baseUrl ? this.client.getDefaultRequestHeaders() : {}),
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
      throw new Error(baseUrl ? 'Could not download binary file' : 'Could not download signed binary file');
    });
    return response.arrayBuffer();
  }

  async getJsonFile(baseUrl: string, fileName: string): Promise<any> {
    if (baseUrl) {
      const response = await this.client.get(`${baseUrl}/${fileName}`).catch(_err => {
        throw Error('Could not download Json file');
      });
      return response.data;
    }
    const headers = { Accept: 'application/json, */*' };
    const response = await this.fetchWithRetry(fileName, { headers, method: 'GET' }).catch(() => {
      throw Error('Could not download signed JSON file');
    });
    if (response.ok === false) {
      throw new Error(`Signed JSON file request failed with status ${response.status}`);
    }
    return response.json();
  }

  async getDMSJsonFile(
    baseUrl: string,
    modelIdentifier: ModelIdentifier,
    fileName: string
  ): Promise<SignedFilesResponse> {
    if (!(modelIdentifier instanceof DMModelIdentifier)) {
      throw new Error('getDMSJsonFile requires a valid DM model identifier');
    }

    const items: SignedFileItem[] = [];
    let cursor: string | undefined = undefined;

    const filter = fileName?.length ? { filter: { paths: [fileName] } } : undefined;
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

      const response = await this.client.post<SignedFilesResponseWithFileData>(`${baseUrl}`, payload);
      const responseData = response.data;
      items.push(
        ...responseData.items.map(item => ({ ...item, signedUrl: stripRestrictedApiGateway(item.signedUrl) }))
      );
      cursor = responseData.nextCursor;
    } while (cursor);

    return { items };
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
