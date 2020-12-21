import { ClientOptions } from '@cognite/sdk';
import sidecar from './sidecar';

type dcClientOptions = {
  baseUrl: string;
};

type ApiClientOptions = ClientOptions & dcClientOptions;

export class ApiClient {
  readonly appId: string;
  private readonly baseUrl: string;
  private accessToken: string = '';

  constructor(options: ApiClientOptions) {
    this.appId = options.appId;
    this.baseUrl = options.baseUrl;
  }

  keepToken(accessToken: string) {
    this.accessToken = accessToken;
  }

  getSuitesRows() {
    return this.makeRequest('/suites', 'GET');
  }

  /**
   * Helper method avoiding boiler plate.
   * @private
   */
  private async makeRequest<T extends object>(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    body?: T
  ) {
    const response = await fetch(this.baseUrl + url, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
        project: this.appId,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    return response.ok
      ? Promise.resolve(await response.json())
      : // eslint-disable-next-line prefer-promise-reject-errors
        Promise.reject((await response.json())?.error as Error);
  }
}

const DEFAULT_CONFIG: ApiClientOptions = {
  appId: 'digital-cockpit',
  baseUrl: sidecar.digitalCockpitApiBaseUrl,
};

export function createApiClient(options: ApiClientOptions = DEFAULT_CONFIG) {
  return new ApiClient(options);
}

export const apiClient = createApiClient();
