import safeGet from 'lodash/get';

import { doReAuth } from './getCogniteSDKClient';

export type FetchHeaders = Record<string, string>;

interface FetchOptions {
  mode?: string;
  headers?: FetchHeaders;
}

export function getJsonOrText(text: string) {
  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}

// type ResponseError = string;
export async function handleResponse<T>(
  response: Response,
  options: FetchOptions = {}
): Promise<T> {
  if (response.status === 401) {
    await doReAuth();
    return Promise.reject(new Error('401 - Trying again with a new token.'));
  }

  if (
    options.headers?.accept === 'image/png' ||
    options.headers?.accept === 'application/pdf'
  ) {
    if (response.status === 422) {
      return Promise.reject(new Error('Unable to convert'));
    }

    // @ts-expect-error 'T' could be instantiated with an arbitrary type which could be unrelated to 'string | 0 | T'
    return response
      .blob()
      .then((blob: Blob) => blob.size && URL.createObjectURL(blob));
  }

  return response.text().then((text: string) => {
    const data = getJsonOrText(text);

    if (!response.ok) {
      if (response.status >= 300) {
        // eslint-disable-next-line
        console.error('Response error:', response);
      }

      if (data && data.error) {
        // api errors!
        return Promise.reject(
          new Error(
            `${safeGet(data.error, 'message')} - ${JSON.stringify(
              safeGet(data, 'error.errors') || safeGet(data, 'error')
            )}`
          )
        );
      }

      const error = data
        ? { ...data, status: response.status }
        : response.status;
      return Promise.reject(error);
    }

    return data;
  });
}

export function fetchPost<T>(url: string, body: any, options?: FetchOptions) {
  const requestOptions = {
    method: 'POST',
    headers: options?.headers,
    body: JSON.stringify(body),
  };

  return fetch(url, requestOptions).then((response) => {
    return handleResponse<T>(response, requestOptions);
  });
}

export function fetchPut<T>(url: string, body: any, options?: FetchOptions) {
  const requestOptions = {
    method: 'PUT',
    headers: options?.headers,
    body: JSON.stringify(body),
  };

  return fetch(url, requestOptions).then((response) =>
    handleResponse<T>(response, requestOptions)
  );
}

export function fetchPatch<T>(url: string, body: any, options?: FetchOptions) {
  const requestOptions = {
    method: 'PATCH',
    headers: options?.headers,
    body: JSON.stringify(body),
  };

  return fetch(url, requestOptions).then((response) =>
    handleResponse<T>(response, requestOptions)
  );
}

interface GetOptions extends FetchOptions {
  handleRawResponse?: (response: Response) => void;
}
export async function fetchGet<T>(url: string, options: GetOptions = {}) {
  const requestOptions = {
    method: 'GET',
    headers: options?.headers,
  };

  const response = await fetch(url, requestOptions);

  if (options.handleRawResponse) {
    options.handleRawResponse(response);
  }

  return handleResponse<T>(response, requestOptions);
}

// interface DeleteOptions extends FetchOptions {}
export function fetchDelete<T>(url: string, options: FetchOptions = {}) {
  const requestOptions = {
    method: 'DELETE',
    headers: options?.headers,
  };

  return fetch(url, requestOptions).then((response) =>
    handleResponse<T>(response, requestOptions)
  );
}
