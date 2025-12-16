/*!
 * Copyright 2021 Cognite AS
 */
import { CogniteClient } from '@cognite/sdk';
import { ModelDataProvider } from '../ModelDataProvider';
import { isDMIdentifier } from '../DataSourceType';
import { CdfModelIdentifier } from '../model-identifiers/CdfModelIdentifier';
import { DMModelIdentifier } from '../model-identifiers/DMModelIdentifier';

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

  async getJsonFile(baseUrl: string, fileName: string): Promise<any> {
    const response = await this.client.get(`${baseUrl}/${fileName}`).catch(_err => {
      throw Error('Could not download Json file');
    });
    return response.data;
  }

  public async getSignedBinaryFiles(
    baseUrl: string,
    fileNames: string[],
    modelIdentifier?: DMModelIdentifier,
    abortSignal?: AbortSignal
  ): Promise<ArrayBuffer[]> {
    if (!(modelIdentifier instanceof CdfModelIdentifier && isDMIdentifier(modelIdentifier))) {
      throw Error('getSignedBinaryFiles is only supported for DM model identifiers');
    }

    const signedUrls: string[] = [];
    let cursor: string | undefined = undefined;

    // Paginate through all signed URLs
    do {
      const payload = {
        data: {
          revision: {
            instanceId: {
              space: modelIdentifier.revisionSpace,
              externalId: modelIdentifier.revisionExternalId
            }
          },
          filter: {
            paths: fileNames
          },
          limit: 100
        }
      };

      if (cursor && 'cursor' in payload.data) {
        payload.data.cursor = cursor;
      }

      const response = await this.client.post(`${baseUrl}`, payload);
      const responseData = response.data as { items?: Array<{ signedUrl?: string }>; nextCursor?: string };
      const items = responseData?.items ?? [];

      // Extract signed URLs from response
      for (const item of items) {
        if (item.signedUrl) {
          signedUrls.push(item.signedUrl);
        }
      }

      cursor = responseData?.nextCursor;
    } while (cursor);

    // Download all binary files from signed URLs
    const downloadPromises = signedUrls.map(signedUrl =>
      this.fetchWithRetry(signedUrl, {
        headers: { Accept: '*/*' },
        signal: abortSignal,
        method: 'GET'
      })
        .then(response => response.arrayBuffer())
        .catch(e => {
          if (e?.name === 'AbortError') {
            throw e;
          }
          throw Error(`Could not download binary file from signed URL: ${signedUrl}`);
        })
    );

    return Promise.all(downloadPromises);
  }
  async getDMSJsonFile(baseUrl: string, fileName: string, modelIdentifier?: DMModelIdentifier): Promise<unknown> {
    if (modelIdentifier instanceof CdfModelIdentifier && isDMIdentifier(modelIdentifier)) {
      const response = await this.client.post(`${baseUrl}`, {
        data: {
          revision: {
            instanceId: {
              space: modelIdentifier.revisionSpace,
              externalId: modelIdentifier.revisionExternalId
            }
          },
          filter: {
            paths: [fileName]
          }
        }
      });
      const responseData = response.data as { items: Array<{ signedUrl: string }> };
      console.log('TEST responseData', responseData);
      const jsonContent = await this.fetchWithRetry(`${responseData.items[0].signedUrl}`, { method: 'GET' });
      console.log('TEST jsonContent', jsonContent);
      return jsonContent.json();
    }
    throw Error('Could not download Json files in batch for non-DM model identifiers');
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
