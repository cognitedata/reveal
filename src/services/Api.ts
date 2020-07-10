import config from 'utils/config';
import { RESTPackageFilter, RESTProject } from '../typings/interfaces';

export type QueryParameters = {
  [property: string]: number | string | boolean | object | undefined;
};

export function buildQueryString(parameters: QueryParameters): string {
  const params = new URLSearchParams();
  Object.entries(parameters).forEach(([key, value]) => {
    if (value) params.set(key, value.toString());
  });
  return params.toString() || '';
}

class Api {
  private readonly headers: {
    'Access-Control-Allow-Origin': string;
    'api-key': string;
    'Content-Type': string;
    Authorization: string;
  };

  constructor(token: string) {
    this.headers = {
      'Access-Control-Allow-Origin': '*',
      'api-key': config.api.key,
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  private async get(url: string, parameters?: QueryParameters): Promise<any> {
    const urlWithStringQuery: string = `${url}?${buildQueryString(
      parameters || {}
    )}`;
    const response = await fetch(urlWithStringQuery, {
      method: 'GET',
      headers: this.headers,
    });
    return response.json();
  }

  public datatypes = {
    get: async (projectId: number | null = null): Promise<string[]> => {
      let queryParameters;
      if (projectId) queryParameters = { project_id: projectId };
      return this.get(`${config.api.url}/datatypes`, queryParameters);
    },
  };

  public objects = {
    get: async () => {
      return this.get(`${config.api.url}/objects`);
    },
  };

  public packages = {
    get: async (filter: RESTPackageFilter): Promise<any> => {
      return this.get(`${config.api.url}/packages`, filter);
    },
  };

  public sources = {
    get: async (): Promise<string[]> => {
      return this.get(`${config.api.url}/sources`);
    },
    getHeartbeats: async (source: string, after: number): Promise<number[]> => {
      const queryParameters = { after };
      return this.get(
        `${config.api.url}/sources/${source}/heartbeats`,
        queryParameters
      );
    },
    getProjects: async (source: string): Promise<RESTProject[]> => {
      return this.get(`${config.api.url}/sources/${source}/projects`);
    },
    getRepositoryTree: async (
      source: string,
      projectExternalId: string
    ): Promise<any> => {
      return this.get(
        `${config.api.url}/sources/${source}/projects/${projectExternalId}/tree`
      );
    },
  };
}

export default Api;
