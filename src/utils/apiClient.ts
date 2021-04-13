import {
  ClientOptions,
  CogniteClient,
  Group,
  ListResponse,
} from '@cognite/sdk';
import { LastVisited, UserSpacePayload } from 'store/userSpace/types';
import { SuiteRow } from 'store/suites/types';
import sidecar from './sidecar';

type dcClientOptions = {
  baseUrl: string;
};

type ApiClientOptions = ClientOptions & dcClientOptions;

export class ApiClient {
  readonly appId: string;
  private readonly baseUrl: string;
  private client: CogniteClient | undefined;

  constructor(options: ApiClientOptions, client?: CogniteClient) {
    this.appId = options.appId;
    this.baseUrl = options.baseUrl;
    this.client = client;
  }

  getSuitesRows(): Promise<ListResponse<SuiteRow[]>> {
    return this.makeGETRequest('/suites');
  }

  getUserGroups(linkedOnly: boolean = true): Promise<Group[]> {
    return this.makeGETRequest(`/groups?linkedOnly=${linkedOnly}`);
  }

  getUserSpace(): Promise<UserSpacePayload> {
    return this.makeGETRequest('/userSpace');
  }
  updateLastVisited(lastVisited: LastVisited[]) {
    return this.makePOSTRequest('/lastVisited', {
      lastVisited,
    });
  }

  /**
   * Helper POST function
   * @private
   */
  private async makePOSTRequest<T extends object>(url: string, data?: T) {
    if (!this.client) {
      throw new Error('Unreachable code');
    }
    const response = await this.client.post(this.baseUrl + url, {
      withCredentials: true,
      data,
    });

    return response.status === 200
      ? Promise.resolve(await response.data)
      : // eslint-disable-next-line prefer-promise-reject-errors
        Promise.reject((await response.data)?.error as Error);
  }

  /**
   * Helper GET function
   * @private
   */
  private async makeGETRequest<T extends object>(url: string) {
    if (!this.client) {
      throw new Error('Unreachable code');
    }
    const response = await this.client.get(this.baseUrl + url, {
      withCredentials: true,
    });

    return response.status === 200
      ? Promise.resolve<T>(await response.data)
      : // eslint-disable-next-line prefer-promise-reject-errors
        Promise.reject((await response.data)?.error as Error);
  }
}

const DEFAULT_CONFIG: ApiClientOptions = {
  appId: 'digital-cockpit',
  baseUrl: sidecar.digitalCockpitApiBaseUrl,
};

export function createApiClient(
  options: ApiClientOptions = DEFAULT_CONFIG,
  client?: CogniteClient
) {
  return new ApiClient(options, client);
}

export const apiClient = createApiClient();
