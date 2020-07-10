import config from '../utils/config';

export const DEFAULT_QUERY_PARAMS = {
  skip: 0,
  limit: 3000,
  include_related: false,
};

export type QueryParameters = {
  [property: string]: number | string | boolean | object;
};

export function buildQueryString(parameters: QueryParameters): string {
  const params = new URLSearchParams();
  Object.entries(parameters).forEach(([key, value]) =>
    params.set(key, value.toString())
  );
  return params.toString();
}

class Api {
  private readonly headers: {
    'Access-Control-Allow-Origin': string;
    'api-key': string;
    'Content-Type': string;
    Authorization: string;
  };

  constructor(token: string = 'FOO') {
    this.headers = {
      'Access-Control-Allow-Origin': '*',
      'api-key': config.api.key,
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  public async get(url: string, parameters?: QueryParameters): Promise<any> {
    const urlWithStringQuery: string = `${url}?${buildQueryString(
      parameters || {}
    )}`;
    const response = await fetch(urlWithStringQuery, {
      method: 'GET',
      headers: this.headers,
    });
    return response.json();
  }

  public async post(
    url: string,
    parameters?: QueryParameters,
    body?:
      | QueryParameters
      | QueryParameters[]
      | number
      | number[]
      | string[]
      | undefined
  ): Promise<any> {
    const urlWithStringQuery: string = `${url}?${buildQueryString(
      parameters || {}
    )}`;
    const response = await fetch(urlWithStringQuery, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body),
    });
    return response.json();
  }

  public async hello(): Promise<{ msg: string }> {
    return this.get(`${config.api.url}/hello/`);
  }

  // noinspection JSUnusedGlobalSymbols
  public objects = {
    get: async (
      queryParameters: QueryParameters = DEFAULT_QUERY_PARAMS
    ): Promise<any> => {
      const mergedParams = { ...DEFAULT_QUERY_PARAMS, ...queryParameters };
      return this.get(
        `${config.api.url}${config.api.project}/objects`,
        mergedParams
      );
    },
    filter: async (
      queryParameters: QueryParameters = DEFAULT_QUERY_PARAMS,
      body: QueryParameters = {}
    ): Promise<any> => {
      const mergedParams = { ...DEFAULT_QUERY_PARAMS, ...queryParameters };
      return this.post(
        `${config.api.url}${config.api.project}/objects/filter`,
        mergedParams,
        body
      );
    },
    create: async (
      queryParameters: QueryParameters = DEFAULT_QUERY_PARAMS,
      body: QueryParameters[] = [{}]
    ): Promise<any> => {
      const mergedParams = { ...DEFAULT_QUERY_PARAMS, ...queryParameters };
      return this.post(
        `${config.api.url}${config.api.project}/objects`,
        mergedParams,
        body
      );
    },
    getByIds: async (
      queryParameters: QueryParameters = DEFAULT_QUERY_PARAMS,
      body: number[] = []
    ): Promise<any> => {
      const mergedParams = { ...DEFAULT_QUERY_PARAMS, ...queryParameters };
      return this.post(
        `${config.api.url}${config.api.project}/objects/byids`,
        mergedParams,
        body
      );
    },
    getByExternalIds: async (
      queryParameters: QueryParameters = DEFAULT_QUERY_PARAMS,
      body: QueryParameters[] = [{}]
    ): Promise<any> => {
      const mergedParams = { ...DEFAULT_QUERY_PARAMS, ...queryParameters };
      return this.post(
        `${config.api.url}${config.api.project}/objects/byextids`,
        mergedParams,
        body
      );
    },
    getRevisions: async (body: QueryParameters[] = [{}]): Promise<any> => {
      return this.post(
        `${config.api.url}${config.api.project}/objects/revisions`,
        undefined,
        body
      );
    },
    getStatus: async (body: QueryParameters[] = [{}]): Promise<any> => {
      return this.post(
        `${config.api.url}${config.api.project}/objects/status`,
        undefined,
        body
      );
    },
    getAllStatuses: async (
      queryParameters: QueryParameters = DEFAULT_QUERY_PARAMS
    ): Promise<any> => {
      const mergedParams = { ...DEFAULT_QUERY_PARAMS, ...queryParameters };
      return this.get(
        `${config.api.url}${config.api.project}/objects/status/list`,
        mergedParams
      );
    },
    readProtoBuf: async (
      queryParameters: QueryParameters = DEFAULT_QUERY_PARAMS
    ): Promise<any> => {
      const mergedParams = { ...DEFAULT_QUERY_PARAMS, ...queryParameters };
      return this.post(
        `${config.api.url}${config.api.project}/objects/read/protobuf`,
        mergedParams
      );
    },
    getStatusHistory: async (
      queryParameters: QueryParameters = DEFAULT_QUERY_PARAMS,
      body: QueryParameters = {}
    ): Promise<any> => {
      const mergedParams = { ...DEFAULT_QUERY_PARAMS, ...queryParameters };
      return this.post(
        `${config.api.url}${config.api.project}/objects/status/history`,
        mergedParams,
        body
      );
    },
    getLatestStatus: async (body: QueryParameters[] = [{}]): Promise<any> => {
      return this.post(
        `${config.api.url}${config.api.project}/objects/status/latest`,
        undefined,
        body
      );
    },
    checkIfLatestRevision: async (
      body: QueryParameters[] = [{}]
    ): Promise<any> => {
      return this.post(
        `${config.api.url}${config.api.project}/objects/revision/isLatest`,
        undefined,
        body
      );
    },
    delete: async (body: QueryParameters[] = [{}]): Promise<any> => {
      return this.post(
        `${config.api.url}${config.api.project}/objects/delete`,
        undefined,
        body
      );
    },
    update: async (
      queryParameters: QueryParameters = DEFAULT_QUERY_PARAMS,
      body: QueryParameters = {}
    ): Promise<any> => {
      const mergedParams = { ...DEFAULT_QUERY_PARAMS, ...queryParameters };
      return this.post(
        `${config.api.url}${config.api.project}/objects/update`,
        mergedParams,
        body
      );
    },
    getDownloadLinks: async (body: number[] = []): Promise<any> => {
      return this.post(
        `${config.api.url}${config.api.project}/objects/downloadlinks`,
        undefined,
        body
      );
    },
    getUploadLinks: async (body: number[] = []): Promise<any> => {
      return this.post(
        `${config.api.url}${config.api.project}/objects/uploadlinks`,
        undefined,
        body
      );
    },
  };

  // noinspection JSUnusedGlobalSymbols
  public packages = {
    get: async (
      queryParameters: QueryParameters = DEFAULT_QUERY_PARAMS
    ): Promise<any> => {
      const mergedParams = { ...DEFAULT_QUERY_PARAMS, ...queryParameters };
      return this.get(
        `${config.api.url}${config.api.project}/packages`,
        mergedParams
      );
    },
    create: async (
      queryParameters: QueryParameters = DEFAULT_QUERY_PARAMS,
      body: QueryParameters[] = [{}]
    ): Promise<any> => {
      const mergedParams = { ...DEFAULT_QUERY_PARAMS, ...queryParameters };
      return this.post(
        `${config.api.url}${config.api.project}/packages`,
        mergedParams,
        body
      );
    },
    delete: async (
      queryParameters: QueryParameters = DEFAULT_QUERY_PARAMS,
      body: string[]
    ): Promise<any> => {
      const mergedParams = { ...DEFAULT_QUERY_PARAMS, ...queryParameters };
      return this.post(
        `${config.api.url}${config.api.project}/packages/delete`,
        mergedParams,
        body
      );
    },
    update: async (body: string[]): Promise<any> => {
      return this.post(
        `${config.api.url}${config.api.project}/packages/update`,
        undefined,
        body
      );
    },
    bulkStatusChange: async (body: QueryParameters[] = [{}]): Promise<any> => {
      return this.post(
        `${config.api.url}${config.api.project}/packages/update`,
        undefined,
        body
      );
    },
    filter: async (body: QueryParameters = {}): Promise<any> => {
      return this.post(
        `${config.api.url}${config.api.project}/packages/filter`,
        undefined,
        body
      );
    },
    setActivelyMonitored: async (
      queryParameters: QueryParameters = DEFAULT_QUERY_PARAMS,
      body: string[]
    ): Promise<any> => {
      const mergedParams = { ...DEFAULT_QUERY_PARAMS, ...queryParameters };
      return this.post(
        `${config.api.url}${config.api.project}/packages/set_actively_monitored`,
        mergedParams,
        body
      );
    },
    createChannel: async (body: QueryParameters = {}): Promise<any> => {
      return this.post(
        `${config.api.url}${config.api.project}/packages/channel/create`,
        undefined,
        body
      );
    },
    getChannels: async (body: QueryParameters = {}): Promise<any> => {
      return this.post(
        `${config.api.url}${config.api.project}/packages/channel/filter`,
        undefined,
        body
      );
    },
    setChannelActivation: async (
      queryParameters: QueryParameters = DEFAULT_QUERY_PARAMS,
      body: QueryParameters = {}
    ): Promise<any> => {
      const mergedParams = { ...DEFAULT_QUERY_PARAMS, ...queryParameters };
      return this.post(
        `${config.api.url}${config.api.project}/packages/activation`,
        mergedParams,
        body
      );
    },
  };

  // noinspection JSUnusedGlobalSymbols
  public projects = {
    get: async (source: string = 'Studio'): Promise<any> => {
      return this.get(
        `${config.api.url}${config.api.project}/projects/${source}`
      );
    },
    create: async (
      queryParameters: QueryParameters = DEFAULT_QUERY_PARAMS
    ): Promise<any> => {
      const mergedParams = { ...DEFAULT_QUERY_PARAMS, ...queryParameters };
      return this.post(
        `${config.api.url}${config.api.project}/projects`,
        mergedParams
      );
    },
    delete: async (body: QueryParameters = {}): Promise<any> => {
      return this.post(
        `${config.api.url}${config.api.project}/projects/delete`,
        undefined,
        body
      );
    },
  };

  // noinspection JSUnusedGlobalSymbols
  public translations = {
    get: async (
      queryParameters: QueryParameters = DEFAULT_QUERY_PARAMS
    ): Promise<any> => {
      const mergedParams = { ...DEFAULT_QUERY_PARAMS, ...queryParameters };
      return this.get(
        `${config.api.url}${config.api.project}/translations`,
        mergedParams
      );
    },
    translate: async (
      queryParameters: QueryParameters = DEFAULT_QUERY_PARAMS,
      body: QueryParameters = {}
    ): Promise<any> => {
      const mergedParams = { ...DEFAULT_QUERY_PARAMS, ...queryParameters };
      return this.post(
        `${config.api.url}${config.api.project}/translations`,
        mergedParams,
        body
      );
    },
    filter: async (
      queryParameters: QueryParameters = DEFAULT_QUERY_PARAMS,
      body: QueryParameters = {}
    ): Promise<any> => {
      const mergedParams = { ...DEFAULT_QUERY_PARAMS, ...queryParameters };
      return this.post(
        `${config.api.url}${config.api.project}/translations/filter`,
        mergedParams,
        body
      );
    },
    bulkTranslate: async (
      queryParameters: QueryParameters = DEFAULT_QUERY_PARAMS,
      body: QueryParameters = {}
    ): Promise<any> => {
      const mergedParams = { ...DEFAULT_QUERY_PARAMS, ...queryParameters };
      return this.post(
        `${config.api.url}${config.api.project}/translations/bulkTranslate`,
        mergedParams,
        body
      );
    },
  };
}

export default Api;
