import { getCogniteSDKClient } from 'apps/platypus/src/environments/cogniteSdk';
import { DataQualityContext } from './dataQualityContext';
import { getTenant } from '@platypus-app/utils/tenant-utils';
import { getCluster } from '@cognite/cdf-utilities';

export type ErrorWrapper<TError> =
  | TError
  | { status: 'unknown'; payload: string };

export type DataQualityFetcherOptions<
  TBody,
  THeaders,
  TQueryParams,
  TPathParams
> = {
  url: string;
  method: string;
  body?: TBody;
  headers?: THeaders;
  queryParams?: TQueryParams;
  pathParams?: TPathParams;
  signal?: AbortSignal;
} & DataQualityContext['fetcherOptions'];

export async function dataQualityFetch<
  TData,
  TError,
  TBody extends {} | FormData | undefined | null,
  THeaders extends {},
  TQueryParams extends {},
  TPathParams extends {}
>({
  url,
  method,
  body,
  headers,
  pathParams,
  queryParams,
  signal,
}: DataQualityFetcherOptions<
  TBody,
  THeaders,
  TQueryParams,
  TPathParams
>): Promise<TData> {
  const cdfClient = getCogniteSDKClient();
  const cluster = getCluster()
  const tenant = getTenant();

  const baseUrl = `https://${cluster}`

  try {
    const tokenCDF = await cdfClient.authenticate();

    const requestHeaders: HeadersInit = {
      Authorization: `Bearer ${tokenCDF}`,
      'Content-Type': 'application/json',
      ...headers,
    };

    const pathParams =  { project: tenant }

    /**
     * As the fetch API is being used, when multipart/form-data is specified
     * the Content-Type header must be deleted so that the browser can set
     * the correct boundary.
     * https://developer.mozilla.org/en-US/docs/Web/API/FormData/Using_FormData_Objects#sending_files_using_a_formdata_object
     */
    if (
      requestHeaders['Content-Type']
        .toLowerCase()
        .includes('multipart/form-data')
    ) {
      delete requestHeaders['Content-Type'];
    }

    const response = await window.fetch(
      `${baseUrl}${resolveUrl(url, queryParams, pathParams)}`,
      {
        signal,
        method: method.toUpperCase(),
        body: body
          ? body instanceof FormData
            ? body
            : JSON.stringify(body)
          : undefined,
        headers: requestHeaders,
      }
    );
    if (!response.ok) {
      let error: ErrorWrapper<TError>;
      try {
        error = await response.json();
      } catch (e) {
        error = {
          status: 'unknown' as const,
          payload:
            e instanceof Error
              ? `Unexpected error (${e.message})`
              : 'Unexpected error',
        };
      }

      throw error;
    }

    if (response.headers.get('content-type')?.includes('json')) {
      return await response.json();
    } else {
      // if it is not a json response, assume it is a blob and cast it to TData
      return (await response.blob()) as unknown as TData;
    }
  } catch (e) {
    let errorObject: Error = {
      name: 'unknown' as const,
      message:
        e instanceof Error ? `Network error (${e.message})` : 'Network error',
      stack: e as string,
    };
    throw errorObject;
  }
}

const resolveUrl = (
  url: string,
  queryParams: Record<string, string> = {},
  pathParams: Record<string, string> = {}
) => {
  let query = new URLSearchParams(queryParams).toString();
  if (query) query = `?${query}`;
  return url.replace(/\{\w*\}/g, (key) => pathParams[key.slice(1, -1)]) + query;
};
