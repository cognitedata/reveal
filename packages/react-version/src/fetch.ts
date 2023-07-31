export async function handleResponse<T>(response: Response): Promise<T> {
  return response.text().then((text: string) => {
    const data = getJsonOrText(text);

    if (!response.ok) {
      if (response.status >= 300) {
        // eslint-disable-next-line
        console.error('Response error:', response);
      }

      const error = data
        ? { ...data, status: response.status }
        : response.status;

      return Promise.reject(error);
    }

    return data;
  });
}

interface GetOptions extends FetchOptions {
  handleRawResponse?: (response: Response) => void;
}
export function fetchGet<T>(url: string, options: GetOptions = {}) {
  const requestOptions = {
    method: 'GET',
    headers: options?.headers,
  };

  return fetch(url, requestOptions).then((response) => {
    if (options.handleRawResponse) {
      options.handleRawResponse(response);
    }
    return handleResponse<T>(response);
  });
}

export function getJsonOrText(text: string) {
  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}

export type FetchHeaders = Record<string, string>;

interface FetchOptions {
  mode?: string;
  headers?: FetchHeaders;
}
