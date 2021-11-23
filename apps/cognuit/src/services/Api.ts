import SIDECAR from 'configs/sidecar';
import { CogniteClient } from '@cognite/sdk';
import {
  ConfigurationResponse,
  BusinessTagsResponse,
  RepositoryTreeResponse,
  ProjectResponse,
  ObjectGetResponse,
  RevisionTranslationsResponse,
  HeartbeatsResponse,
  SourcesResponse,
  DatatypesResponse,
  DataTransferResponse,
  DataStatusResponse,
  ConnectorInstance,
} from 'types/ApiInterface';
import { ErrorDistributionResponse } from 'types/MockApiInterface';

import {
  Project,
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

  public reference = {
    getSources: async (): Promise<SourcesResponse[]> => {
      return this.get(`${this.baseURL}/sources`);
    },
    getDatatypes: async (
      projectId: number | null = null
    ): Promise<DatatypesResponse[]> => {
      let queryParameters;
      if (projectId) queryParameters = { project_id: projectId };
      return this.get(`${this.baseURL}/datatypes`, queryParameters);
    },
  };

  public connectors = {
    get: async (source: string): Promise<ConnectorInstance> => {
      const queryParameters = { source };
      return this.get(`${this.baseURL}/instances`, queryParameters);
    },
    getHeartbeats: async (
      source: string,
      instance: string,
      after: number
    ): Promise<HeartbeatsResponse> => {
      const queryParameters = { source, instance, after };
      return this.get(`${this.baseURL}/heartbeats`, queryParameters);
    },
  };

  public projects = {
    // After implementing (CWP-1457), the projects should always be listed using
    // getByInstance in the create new config page, so getBySource can be removed
    // from both here and the API
    getBySource: async (
      source: Source | string
    ): Promise<ProjectResponse[]> => {
      const queryParameters = { source };
      return this.get(`${this.baseURL}/projects`, queryParameters);
    },
    getByInstance: async (
      source: Source | string,
      instance: string
    ): Promise<ProjectResponse[]> => {
      const queryParameters = { source, instance };
      return this.get(`${this.baseURL}/projects`, queryParameters);
    },
  };

  public tags = {
    getStatusTags: async (): Promise<DataStatusResponse[]> => {
      const queryParameters = { synced: true };
      return this.get(`${this.baseURL}/tags/status`, queryParameters);
    },
    getBusinessTags: async (project: Project): Promise<BusinessTagsResponse> =>
      this.post(`${this.baseURL}/tags/business/list`, project),
  };

  public configurations = {
    get: async (): Promise<ConfigurationResponse[]> =>
      this.get(`${this.baseURL}/configurations`),
    create: async (data: any): Promise<ConfigurationResponse> =>
      this.post(`${this.baseURL}/configurations`, data),
    getFiltered: async (
      options: RESTConfigurationsFilter
    ): Promise<ConfigurationResponse[]> =>
      this.post(`${this.baseURL}/configurations/filter`, options),
    startOrStopConfiguration: async (
      id: number,
      isActive: boolean
    ): Promise<ConfigurationResponse> => {
      if (isActive) {
        return this.post(`${this.baseURL}/configurations/${id}/update`, {
          status_active: false,
        });
      }
      return this.post(`${this.baseURL}/configurations/${id}/update`, {
        status_active: true,
      });
    },
    update: async (id: number, options: any): Promise<ConfigurationResponse> =>
      this.post(`${this.baseURL}/configurations/${id}/update`, options),
    restart: async (id: number): Promise<ConfigurationResponse> =>
      this.post(`${this.baseURL}/configurations/${id}/restart`, {}),
  };

  public objects = {
    get: async (): Promise<ObjectGetResponse[]> =>
      this.get(`${this.baseURL}/objects`),
    getFiltered: async (
      options: RESTObjectsFilter
    ): Promise<ObjectGetResponse[]> =>
      this.post(`${this.baseURL}/objects/filter`, options),
    getSingleObject: async (objectId: number): Promise<ObjectGetResponse[]> =>
      this.post(`${this.baseURL}/objects/byids`, [objectId]),
  };

  public revisions = {
    getAllobjectRevisions: async (
      objectId: string
    ): Promise<ObjectGetResponse[]> =>
      this.get(`${this.baseURL}/objects/${objectId}/revisions`),
    getSingleRevision: async (
      objectId: string,
      revisionId: string
    ): Promise<ObjectGetResponse> =>
      this.get(`
      ${this.baseURL}/objects/${objectId}/revisions/${revisionId}`),
  };

  public translations = {
    getTranslatedRevisions: async (
      objectId: string,
      revisionId: string
    ): Promise<RevisionTranslationsResponse[]> =>
      this.get(`
      ${this.baseURL}/objects/${objectId}/revisions/${revisionId}/translations`),
    filterTransfers: async (
      filter: RESTTransfersFilter
    ): Promise<DataTransferResponse[]> =>
      this.post(`${this.baseURL}/translations/filtertransfers`, filter),
  };

  // Note - these refer to the Petrel Studio repository tree, so it is not used outside
  // the context of the OW->PS config creation, which is not currently in use
  public packages = {
    getFiltered: async (filter: RESTPackageFilter): Promise<any> =>
      this.get(`${this.baseURL}/packages`, filter),
    getRepositoryTree: async (
      project: Project
    ): Promise<RepositoryTreeResponse[]> =>
      this.post(`${this.baseURL}/packages/treeview`, project),
  };

  // Note - these are mock methods. The actual API does not have support for statitics YET
  public statistics = {
    getErrorDistribution: async (
      source: string,
      after: number
    ): Promise<ErrorDistributionResponse[]> => {
      const queryParameters = { after };
      // eslint-disable-next-line no-console
      console.log('Not used yet: queryParameters', queryParameters);
      // return this.get(`${this.baseURL}/sources/${source}/errors`, queryParameters);
      if (source === 'Studio') {
        return Promise.resolve(mockDataErrorsPsToOw);
      }
      return Promise.resolve(mockDataErrorsOwToPs);
    },
    getTranslationStatistics: async (
      _source: string,
      timeRange: string
    ): Promise<TranslationStatisticsObject[]> => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // const queryParameters = { timeRange };
      // return this.get(`${this.baseURL}/sources/${source}/statistics`, queryParameters);
      if (timeRange === 'month') {
        return Promise.resolve(mockDataTranslationsStatsMonthly());
      }
      if (timeRange === 'day') {
        return Promise.resolve(mockDataTranslationsStatsDaily());
      }
      return Promise.resolve(mockDataTranslationsStatsHourly());
    },
  };
}

export default Api;
