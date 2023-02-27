import {
  CogniteClient,
  HttpQueryParams,
  HttpRequestOptions,
  HttpResponse,
} from '@cognite/sdk';

import { PlatypusError } from '@platypus-core/boundaries/types';

export abstract class BaseApiService {
  public readonly baseUrl;
  public readonly defaultHeaders;

  constructor(private readonly cdfClient: CogniteClient) {
    this.baseUrl = `/api/v1/projects/${this.cdfClient.project}/models`;
    this.defaultHeaders = {
      'cdf-version': 'alpha',
    };
  }

  protected async sendPostRequest(
    path: string,
    payload: any,
    queryParams?: HttpQueryParams
  ): Promise<any> {
    const options: HttpRequestOptions = {
      headers: this.defaultHeaders,
      data: payload,
    };
    if (queryParams) {
      options.params = queryParams;
    }
    return this.cdfClient
      .post(`${this.baseUrl}/${path}`, options)
      .then((response) => this.handleApiResponse(response))
      .catch((err) => Promise.reject(PlatypusError.fromSdkError(err)));
  }

  protected async sendGetRequest(
    path: string,
    queryParams: HttpQueryParams
  ): Promise<any> {
    return this.cdfClient
      .get(`${this.baseUrl}/${path}`, {
        headers: this.defaultHeaders,
        params: queryParams,
      })
      .then((response) => this.handleApiResponse(response))
      .catch((err) => Promise.reject(PlatypusError.fromSdkError(err)));
  }

  protected handleApiResponse(response: HttpResponse<any>) {
    return new Promise((resolve, reject) => {
      if (response.data.errors) {
        reject({ status: response.status, errors: response.data.errors });
      } else {
        resolve(response.data);
      }
    });
  }
}
