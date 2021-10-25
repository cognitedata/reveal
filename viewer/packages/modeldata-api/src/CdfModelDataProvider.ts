/*!
 * Copyright 2021 Cognite AS
 */
import { CogniteClient } from '@cognite/sdk';

import { ModelDataProvider } from './types';

/**
 * Provides 3D V2 specific extensions for the standard CogniteClient used by Reveal.
 */
export class CdfModelDataProvider implements ModelDataProvider {
  private readonly client: CogniteClient;

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
}

async function fetchWithRetry(input: RequestInfo, options: RequestInit | undefined, retries: number = 3) {
  let error: Error | undefined;
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(input, options);
    } catch (err) {
      // Keep first error only
      if (error !== undefined) {
        error = err;
      }
    }
  }
  throw error;
}
