/*!
 * Copyright 2021 Cognite AS
 */
import { CogniteClient } from '@cognite/sdk';

import { ModelDataClient } from './types';

/**
 * Provides 3D V2 specific extensions for the standard CogniteClient used by Reveal.
 */
export class CdfModelDataClient implements ModelDataClient {
  private readonly client: CogniteClient;
  private appId: string | undefined;

  constructor(client: CogniteClient) {
    this.client = client;
  }

  get headers() {
    return this.client.getDefaultRequestHeaders();
  }

  public async getBinaryFile(baseUrl: string, fileName: string): Promise<ArrayBuffer> {
    const url = `${baseUrl}/${fileName}`;
    const headers = {
      ...this.client.getDefaultRequestHeaders(),
      Accept: '*/*'
    };

    const response = await fetchWithRetry(url, { headers, method: 'GET' });
    return response.arrayBuffer();
  }

  async getJsonFile(baseUrl: string, fileName: string): Promise<any> {
    const response = await this.client.get(`${baseUrl}/${fileName}`);
    return response.data;
  }

  public getApplicationIdentifier(): string {
    if (this.appId === undefined) {
      this.appId = getSdkApplicationId(this.client);
    }
    return this.appId;
  }
}

async function fetchWithRetry(input: RequestInfo, options: RequestInit | undefined, retries: number = 3) {
  let error: Error | undefined;
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(input, options);
    } catch (err: any) {
      // Keep first error only
      if (error !== undefined) {
        error = err;
      }
    }
  }
  throw error;
}

/**
 * Determines the `appId` of the `CogniteClient` provided.
 * @param sdk Instance of `CogniteClient`.
 * @returns Application ID or 'unknown' if not found.
 */
function getSdkApplicationId(sdk: CogniteClient): string {
  const headers = sdk.getDefaultRequestHeaders();
  return headers['x-cdp-app'] || 'unknown';
}
