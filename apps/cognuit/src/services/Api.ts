import SIDECAR from 'configs/sidecar';
import { CogniteClient } from '@cognite/sdk';
import {
  ConfigurationsResponse,
  ProjectBusinessTagsResponse,
  ProjectRepositoryTheeResponse,
  ProjectsResponse,
  ObjectsRevisionsResponse,
  RevisionTranslationsResponse,
  SourcesHeartbeatsResponse,
  SourcesResponse,
  DatatypesResponse,
  DataTransfersResponse,
  ErrorDistributionResponse,
} from 'types/ApiInterface';

import {
  GenericResponseObject,
  RESTConfigurationsFilter,
  RESTObjectsFilter,
  RESTPackageFilter,
  RESTTransfersFilter,
  Source,
  TranslationStatisticsObject,
} from '../typings/interfaces';

import {
  mockDataErrorsPsToOw,
  mockDataErrorsOwToPs,
  mockDataTranslationsStatsDaily,
  mockDataTranslationsStatsHourly,
  mockDataTranslationsStatsMonthly,
} from './mockData';
import { CustomError } from './CustomError';

export type QueryParameters = {
  [property: string]: number | string | boolean | undefined;
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

  private sdk?: CogniteClient;
  private readonly baseURL: string;

  constructor(token: string, sdk?: CogniteClient) {
    this.headers = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    this.baseURL = SIDECAR.cognuitApiBaseUrl;
    if (sdk) {
      this.sdk = sdk;
    }
  }

  private async get(url: string, parameters?: QueryParameters): Promise<any> {
    if (!this.sdk) {
      return [
        {
          error: true,
          status: 500,
          statusText: 'SDK not provided',
        },
      ];
    }
    const urlWithStringQuery = `${url}?${buildQueryString(parameters || {})}`;
    const response = await fetch(urlWithStringQuery, {
      method: 'GET',
      headers: this.headers,
    });
    if (!response.ok) {
      return Promise.reject(
        new CustomError(response.statusText, response.status)
      );
    }
    return Promise.resolve(response.json());
  }

  private async post(url: string, data: any): Promise<any> {
    if (!this.sdk) {
      return [
        {
          error: true,
          status: 500,
          statusText: 'SDK not provided',
        },
      ];
    }
    const response = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      return Promise.reject(
        new CustomError(response.statusText, response.status)
      );
    }
    return Promise.resolve(response.json());
  }

  public datatransfers = {
    get: async (
      filter: RESTTransfersFilter
    ): Promise<DataTransfersResponse[]> =>
      this.post(`${this.baseURL}/datatransfers/filter`, filter),
  };

  public datatypes = {
    get: async (
      projectId: number | null = null
    ): Promise<DatatypesResponse[]> => {
      let queryParameters;
      if (projectId) queryParameters = { project_id: projectId };
      return this.get(`${this.baseURL}/datatypes`, queryParameters);
    },
  };

  public objects = {
    get: async (): Promise<ObjectsRevisionsResponse[]> =>
      this.get(`${this.baseURL}/objects`),
    getFiltered: async (
      options: RESTObjectsFilter
    ): Promise<ObjectsRevisionsResponse[]> =>
      this.post(`${this.baseURL}/objects/filter`, options),
    getSingleObject: async (
      objectId: number
    ): Promise<ObjectsRevisionsResponse[]> =>
      this.post(`${this.baseURL}/objects/byids`, [objectId]),
    getDatatransfersForRevision: async (
      objectId: number,
      revision: string
    ): Promise<GenericResponseObject> =>
      this.get(
        `${this.baseURL}/objects/${objectId}/revisions/${revision}/datatransfers`
      ),
  };

  public packages = {
    get: async (filter: RESTPackageFilter): Promise<any> =>
      this.get(`${this.baseURL}/packages`, filter),
  };

  public projects = {
    get: async (source: Source | string): Promise<ProjectsResponse[]> =>
      this.get(`${this.baseURL}/sources/${source}/projects`),
    getBusinessTags: async (
      source: Source,
      project: string
    ): Promise<ProjectBusinessTagsResponse> =>
      this.get(`${this.baseURL}/sources/${source}/projects/${project}/tags`),
  };

  public sources = {
    get: async (): Promise<SourcesResponse[]> =>
      this.get(`${this.baseURL}/sources`),
    getHeartbeats: async (
      source: string,
      after: number
    ): Promise<SourcesHeartbeatsResponse> => {
      const queryParameters = { after };
      return this.get(
        `${this.baseURL}/sources/${source}/heartbeats`,
        queryParameters
      );
    },
    getProjects: async (source: string): Promise<ProjectsResponse[]> =>
      this.get(`${this.baseURL}/sources/${source}/projects`),
    getRepositoryTree: async (
      source: string,
      projectExternalId: string
    ): Promise<ProjectRepositoryTheeResponse[]> =>
      this.get(
        `${this.baseURL}/sources/${source}/projects/${projectExternalId}/tree`
      ),
    getErrorDistribution: async (
      source: string,
      after: number
    ): Promise<ErrorDistributionResponse[]> => {
      const queryParameters = { after };
      // eslint-disable-next-line no-console
      console.log('Not used yet: queryParameters', queryParameters);
      // return this.get(`${this.baseURL}/sources/${source}/errors`, queryParameters);
      if (source === 'Studio') {
        return mockDataErrorsPsToOw;
      }
      return mockDataErrorsOwToPs;
    },
    getTranslationStatistics: async (
      _source: string,
      timeRange: string
    ): Promise<TranslationStatisticsObject[]> => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // const queryParameters = { timeRange };
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
    get: async (): Promise<ConfigurationsResponse[]> =>
      this.get(`${this.baseURL}/configurations`),
    create: async (data: any): Promise<ConfigurationsResponse> =>
      this.post(`${this.baseURL}/configurations`, data),
    getFiltered: async (
      options: RESTConfigurationsFilter
    ): Promise<ConfigurationsResponse[]> =>
      this.post(`${this.baseURL}/configurations/filter`, options),
    startOrStopConfiguration: async (
      id: number,
      isActive: boolean
    ): Promise<ConfigurationsResponse> => {
      if (isActive) {
        return this.post(`${this.baseURL}/configurations/${id}/update`, {
          status_active: false,
        });
      }
      return this.post(`${this.baseURL}/configurations/${id}/update`, {
        status_active: true,
      });
    },
    update: async (id: number, options: any): Promise<ConfigurationsResponse> =>
      this.post(`${this.baseURL}/configurations/${id}/update`, options),
    restart: async (id: number): Promise<ConfigurationsResponse> =>
      this.post(`${this.baseURL}/configurations/${id}/restart`, {}),
  };

  public revisions = {
    get: async (objectId: string): Promise<ObjectsRevisionsResponse[]> =>
      this.get(`${this.baseURL}/objects/${objectId}/revisions`),
    getSingleRevision: async (
      objectId: string,
      revisionId: string
    ): Promise<ObjectsRevisionsResponse> =>
      this.get(`
      ${this.baseURL}/objects/${objectId}/revisions/${revisionId}`),
    getRevisionTranslations: async (
      objectId: string,
      revisionId: string
    ): Promise<RevisionTranslationsResponse[]> =>
      this.get(`
      ${this.baseURL}/objects/${objectId}/revisions/${revisionId}/translations`),
  };
}

export default Api;
