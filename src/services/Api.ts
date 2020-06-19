import config from '../utils/config';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'api-key': config.api.key,
  'Content-Type': 'application/json',
};

const DEFAULT_QUERY_PARAMS = {
  skip: 0,
  limit: 3000,
  include_related: false,
};

export type QueryParameters = {
  [property: string]: number | string | boolean;
};

export function buildQueryString(parameters: QueryParameters): string {
  const params = new URLSearchParams();
  Object.entries(parameters).forEach(([key, value]) =>
    params.set(key, value.toString())
  );
  return params.toString();
}

class Api {
  private static async get(
    url: string,
    parameters?: QueryParameters
  ): Promise<any> {
    const urlWithStringQuery: string = `${url}?${buildQueryString(
      parameters || {}
    )}`;
    const response = await fetch(urlWithStringQuery, {
      method: 'GET',
      headers,
    });
    return response.json();
  }

  public static async hello(): Promise<{ msg: string }> {
    return Api.get(`${config.api.url}/hello`);
  }

  public static objects = {
    get: async (
      queryParameters: QueryParameters = DEFAULT_QUERY_PARAMS
    ): Promise<any> => {
      const mergedParams = { ...DEFAULT_QUERY_PARAMS, ...queryParameters };
      return Api.get(
        `${config.api.url}${config.api.project}/objects`,
        mergedParams
      );
    },
  };
}

export default Api;
