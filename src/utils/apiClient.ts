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
    return fetch(`${this.baseUrl}/suites`, {
      method: 'GET',
      headers: {
        Accept: 'applicatin/json',
        'Content-Type': 'applicatin/json',
        Authorization: `Bearer ${this.accessToken}`,
        project: this.appId,
      },
    }).then((res) => res.json());
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
