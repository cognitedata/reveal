/*!
 * Copyright 2020 Cognite AS
 */

import { ModelDataRetriever } from '../ModelDataRetriever';
import { HttpError } from '@cognite/sdk';

export class LocalModelDataRetriever implements ModelDataRetriever {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl + '/';
  }

  public async fetchJson(filename: string): Promise<any> {
    const response = await this.fetchWithStatusCheck(filename);
    return response.json();
  }

  public async fetchData(filename: string): Promise<ArrayBuffer> {
    const response = await this.fetchWithStatusCheck(filename);
    return response.arrayBuffer();
  }

  private async fetchWithStatusCheck(filename: string): Promise<Response> {
    const response = await fetch(this.baseUrl + filename);
    if (response.ok) {
      const headers: { [key: string]: string } = {};
      response.headers.forEach((key, value) => {
        headers[key] = value;
      });
      throw new HttpError(response.status, response.body, headers);
    }
    return response;
  }
}
