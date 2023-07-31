import { log } from '@cognite/react-container';

type FetchHeaders = Record<string, string>;

interface FetchOptions {
  mode?: string;
  headers?: FetchHeaders;
}

export async function fetchGet<T>(url: string, options: FetchOptions = {}) {
  const requestOptions = {
    method: 'GET',
    headers: options?.headers,
  };

  const response = await fetch(url, requestOptions);

  return handleResponse<T>(response, requestOptions);
}

function getJsonOrText(text: string) {
  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}

async function handleResponse<T>(
  response: Response,
  _options: FetchOptions = {}
): Promise<T> {
  return response.text().then((text: string) => {
    const data = getJsonOrText(text);

    if (response.ok) {
      return data;
    }

    if (response.status >= 300) {
      log('Response error:', [response], 2);
    }

    if (data && data.error) {
      // api errors!
      return Promise.reject(new Error(JSON.stringify(data.error)));
    }

    const error = data ? { ...data, status: response.status } : response.status;
    return Promise.reject(error);
  });
}
