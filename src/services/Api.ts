import { SIDECAR } from 'utils/sidecar';
import {
  GenericResponseObject,
  RESTConfigurationsFilter,
  RESTObjectsFilter,
  RESTPackageFilter,
  RESTProject,
  RESTTransfersFilter,
  Source,
} from '../typings/interfaces';
import sdk from '../utils/cognitesdk';

import {
  mockDataErrorsPsToOw,
  mockDataErrorsOwToPs,
  mockDataTranslationsStatsDaily,
  mockDataTranslationsStatsHourly,
  mockDataTranslationsStatsMonthly,
} from './mockData';

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
    'Content-Type': string;
    Authorization: string;
  };

  private readonly baseURL: string;

  constructor(token: string) {
    this.headers = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    this.baseURL = SIDECAR.cognuitApiBaseUrl;
  }

  private async get(url: string, parameters?: QueryParameters): Promise<any> {
    const status = await sdk.login.status();
    if (!status) {
      return [
        {
          error: true,
          status: 401,
          statusText:
            'No user logged in. Refresh page to auto authenticate again',
        },
      ];
    }
    const urlWithStringQuery: string = `${url}?${buildQueryString(
      parameters || {}
    )}`;
    const response = await fetch(urlWithStringQuery, {
      method: 'GET',
      headers: this.headers,
    });
    if (!response.ok) {
      return [
        {
          error: true,
          status: response.status,
          statusText: response.statusText,
        },
      ];
    }
    return response.json();
  }

  private async post(url: string, data: any): Promise<any> {
    const status = await sdk.login.status();
    if (!status) {
      return [
        {
          error: true,
          status: 401,
          statusText:
            'No user logged in. Refresh page to auto authenticate again',
        },
      ];
    }
    const response = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      return [
        {
          error: true,
          status: response.status,
          statusText: response.statusText,
        },
      ];
    }
    return response.json();
  }

  public datatransfers = {
    get: async (filter: RESTTransfersFilter): Promise<any> => {
      return this.post(`${this.baseURL}/datatransfers/filter`, filter);
    },
  };

  public datatypes = {
    get: async (projectId: number | null = null): Promise<string[]> => {
      let queryParameters;
      if (projectId) queryParameters = { project_id: projectId };
      return this.get(`${this.baseURL}/datatypes`, queryParameters);
    },
  };

  public objects = {
    get: async (): Promise<GenericResponseObject[]> => {
      return this.get(`${this.baseURL}/objects`);
    },
    getFiltered: async (
      options: RESTObjectsFilter
    ): Promise<GenericResponseObject[]> => {
      return this.post(`${this.baseURL}/objects/filter`, options);
    },
    getSingleObject: async (
      objectId: number
    ): Promise<GenericResponseObject[]> => {
      return this.post(`${this.baseURL}/objects/byids`, [objectId]);
    },
    getDatatransfersForRevision: async (
      objectId: number,
      revision: string
    ): Promise<GenericResponseObject> => {
      return this.get(
        `${this.baseURL}/objects/${objectId}/revisions/${revision}/datatransfers`
      );
    },
  };

  public packages = {
    get: async (filter: RESTPackageFilter): Promise<any> => {
      return this.get(`${this.baseURL}/packages`, filter);
    },
  };

  public projects = {
    get: async (source: Source | string): Promise<GenericResponseObject[]> => {
      return this.get(`${this.baseURL}/sources/${source}/projects`);
    },
    getBusinessTags: async (
      source: Source,
      project: string
    ): Promise<string[]> => {
      return this.get(
        `${this.baseURL}/sources/${source}/projects/${project}/tags`
      );
    },
  };

  public sources = {
    get: async (): Promise<string[]> => {
      return this.get(`${this.baseURL}/sources`);
    },
    getHeartbeats: async (
      source: string,
      after: number
    ): Promise<GenericResponseObject[]> => {
      const queryParameters = { after };
      return this.get(
        `${this.baseURL}/sources/${source}/heartbeats`,
        queryParameters
      );
    },
    getProjects: async (source: string): Promise<RESTProject[]> => {
      return this.get(`${this.baseURL}/sources/${source}/projects`);
    },
    getRepositoryTree: async (
      source: string,
      projectExternalId: string
    ): Promise<any> => {
      return this.get(
        `${this.baseURL}/sources/${source}/projects/${projectExternalId}/tree`
      );
    },
    getErrorDistribution: async (
      source: string,
      after: number
    ): Promise<GenericResponseObject[]> => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const queryParameters = { after };
      // return this.get(`${this.baseURL}/sources/${source}/errors`, queryParameters);
      if (source === 'Studio') {
        return mockDataErrorsPsToOw;
      }
      return mockDataErrorsOwToPs;
    },
    getTranslationStatistics: async (
      source: string,
      timeRange: string
    ): Promise<GenericResponseObject[]> => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const queryParameters = { timeRange };
      // return this.get(`${this.baseURL}/sources/${source}/statistics`, queryParameters);
      if (timeRange === 'month') {
        return mockDataTranslationsStatsMonthly();
      }
      if (timeRange === 'day') {
        return mockDataTranslationsStatsDaily();
      }
      return mockDataTranslationsStatsHourly();
    },
  };

  public configurations = {
    get: async (): Promise<GenericResponseObject[]> => {
      return this.get(`${this.baseURL}/configurations`);
    },
    create: async (data: any): Promise<GenericResponseObject> => {
      return this.post(`${this.baseURL}/configurations`, data);
    },
    getFiltered: async (
      options: RESTConfigurationsFilter
    ): Promise<GenericResponseObject[]> => {
      return this.post(`${this.baseURL}/configurations/filter`, options);
    },
    startOrStopConfiguration: async (
      id: number,
      isActive: boolean
    ): Promise<GenericResponseObject[] | GenericResponseObject> => {
      if (isActive) {
        return this.post(`${this.baseURL}/configurations/${id}/update`, {
          status_active: false,
        });
      }
      return this.post(`${this.baseURL}/configurations/${id}/update`, {
        status_active: true,
      });
    },
    update: async (
      id: number,
      options: any
    ): Promise<GenericResponseObject[] | GenericResponseObject> => {
      return this.post(`${this.baseURL}/configurations/${id}/update`, options);
    },
  };

  public revisions = {
    get: async (objectId: string): Promise<GenericResponseObject[]> => {
      return this.get(`${this.baseURL}/objects/${objectId}/revisions`);
    },
    getSingleRevision: async (
      objectId: string,
      revisionId: string
    ): Promise<GenericResponseObject[]> => {
      return this.get(`
      ${this.baseURL}/objects/${objectId}/revisions/${revisionId}`);
    },
    getRevisionTranslations: async (
      objectId: string,
      revisionId: string
    ): Promise<GenericResponseObject[]> => {
      return this.get(`
      ${this.baseURL}/objects/${objectId}/revisions/${revisionId}/translations`);
    },
  };
}

export default Api;
