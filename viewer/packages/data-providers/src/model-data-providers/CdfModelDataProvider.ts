/*!
 * Copyright 2021 Cognite AS
 */
import { HttpError, type CogniteClient, type HttpRequestOptions } from '@cognite/sdk';
import type { ModelDataProvider } from '../ModelDataProvider';
import { DMModelIdentifier } from '../model-identifiers/DMModelIdentifier';
import type { SignedFileItem } from '../types';
import { stripRestrictedApiGateway } from '../utilities/signedUrlUtils';
import { decompressBinaryResponseBody, parseJsonResponseBody } from '../utilities/gzipUtils';
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
    const isBaseUrlEmpty = baseUrl === '';
    const url = isBaseUrlEmpty ? fileName : `${baseUrl}/${fileName}`;
    const headers = {
      ...(!isBaseUrlEmpty ? this.client.getDefaultRequestHeaders() : {}),
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
      throw new Error('Could not download binary file');
    });
    if (isBaseUrlEmpty === true) {
      if (response.ok === false) {
        throw createHttpErrorFromResponse(response);
      }
      return decompressBinaryResponseBody(response);
    }
    return response.arrayBuffer();
  }

  async getJsonFile(baseUrl: string, fileName: string): Promise<any> {
    if (baseUrl !== '') {
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
      throw createHttpErrorFromResponse(response);
    }
    return parseJsonResponseBody(response);
  }

  async getFileUrlsForModel(
    baseUrl: string,
    modelIdentifier: ModelIdentifier,
    fileNameFilter?: string
  ): Promise<SignedFileItem[]> {
    if (!(modelIdentifier instanceof DMModelIdentifier)) {
      throw new Error('getFileUrlsForModel requires a valid DM model identifier');
    }

    const items: SignedFileItem[] = [];
    let cursor: string | undefined = undefined;

    const filter = fileNameFilter === undefined ? {} : { filter: { paths: [fileNameFilter] } };
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
          cursor
        }
      };

      const response = await this.client
        .post<{ items: SignedFileItem[]; nextCursor?: string }>(baseUrl, payload)
        .catch(_err => {
          throw new Error('Could not fetch signed file URLs for model');
        });
      const responseData = response.data;
      items.push(
        // Strip restricted-api gateway prefix so the signed URL works from the browser directly
        ...responseData.items.map(item => ({ ...item, signedUrl: stripRestrictedApiGateway(item.signedUrl) }))
      );
      cursor = responseData.nextCursor;
    } while (cursor);

    return items;
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

function createHttpErrorFromResponse(response: Response): HttpError {
  const headers: { [key: string]: string } = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });
  return new HttpError(
    response.status,
    { error: { code: response.status, message: response.statusText || 'Signed URL request failed' } },
    headers
  );
}
