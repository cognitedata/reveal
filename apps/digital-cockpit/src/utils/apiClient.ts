import { ClientOptions, CogniteClient, Group } from '@cognite/sdk';
import { LastVisited, UserSpacePayload } from 'store/userSpace/types';
import { Suite } from 'store/suites/types';
import sidecar from './sidecar';

type AppDataResponse = {
  suites: Suite[];
  groups: Group[];
  applications: string[];
};

type dcClientOptions = {
  baseUrl?: string;
  project: string;
};

type ApiClientOptions = ClientOptions & dcClientOptions;

export class ApiClient {
  readonly appId: string;
  private readonly baseUrl: string;
  private client: CogniteClient | undefined;

  constructor(
    { appId, baseUrl, project }: ApiClientOptions,
    client?: CogniteClient
  ) {
    this.appId = appId;
    this.baseUrl = `${baseUrl}/${project}/v2`;
    this.client = client;
  }

  getAppData(linkedGroupsOnly = true): Promise<AppDataResponse> {
    return this.makeGETRequest(`/appData?linkedGroupsOnly=${linkedGroupsOnly}`);
  }

  getUserGroups(linkedOnly = true): Promise<Group[]> {
    return this.makeGETRequest(`/groups?linkedOnly=${linkedOnly}`);
  }

  getSuites(): Promise<Suite[]> {
    return this.makeGETRequest('/suites');
  }

  saveSuite(suite: Suite): Promise<void> {
    return this.makePOSTRequest('/suites', { suite });
  }

  deleteSuite(suiteKey: string): Promise<void> {
    return this.makeDELETERequest('/suites', { key: suiteKey });
  }

  getUserSpace(): Promise<UserSpacePayload> {
    return this.makeGETRequest('/userSpace');
  }
  updateLastVisited(lastVisited: LastVisited[]) {
    return this.makePOSTRequest('/lastVisited', {
      lastVisited,
    });
  }
  // TODO(CM-406) methods to move data from RAW to DB Service
  syncSuites() {
    return this.makeGETRequest('/suites/sync');
  }
  syncLastVisited() {
    return this.makeGETRequest('/lastVisited/sync');
  }

  getApplications(): Promise<{ applications: string[] }> {
    return this.makeGETRequest('/applications');
  }
  saveApplications(applications: string[]): Promise<void> {
    return this.makePOSTRequest('/applications', { applications });
  }

  /**
   * Helper POST function
   * @private
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
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
  // eslint-disable-next-line @typescript-eslint/ban-types
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

  /**
   * Helper DELETE function
   * @private
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  private async makeDELETERequest<T extends object>(url: string, data?: T) {
    if (!this.client) {
      throw new Error('Unreachable code');
    }
    const response = await this.client.delete(this.baseUrl + url, {
      withCredentials: true,
      data,
    });

    return response.status === 200
      ? Promise.resolve(await response.data)
      : // eslint-disable-next-line prefer-promise-reject-errors
        Promise.reject((await response.data)?.error as Error);
  }
}

const DEFAULT_CONFIG: Partial<ApiClientOptions> = {
  appId: 'digital-cockpit',
  baseUrl: sidecar.digitalCockpitApiBaseUrl,
};

export function createApiClient(
  options: ApiClientOptions,
  client?: CogniteClient
) {
  return new ApiClient({ ...DEFAULT_CONFIG, ...options }, client);
}
