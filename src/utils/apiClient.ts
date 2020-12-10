import { ClientOptions } from '@cognite/sdk';

type dcClientOptions = {};

type ApiClientOptions = ClientOptions & dcClientOptions;

export class ApiClient {
  readonly appId: string;
  private accessToken: string = '';

  constructor(options: ApiClientOptions) {
    this.appId = options.appId;
  }

  keepToken(accessToken: string) {
    this.accessToken = accessToken;
  }

  getSuitesRows() {
    return fetch('http://localhost:8001/suites', {
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
};

export function createApiClient(options: ApiClientOptions = DEFAULT_CONFIG) {
  return new ApiClient(options);
}

export const apiClient = createApiClient();
