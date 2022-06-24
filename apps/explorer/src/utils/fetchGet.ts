export type FetchHeaders = Record<string, string>;

interface FetchOptions {
  mode?: string;
  headers?: FetchHeaders;
}

function getJsonOrText(text: string) {
  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}

export async function handleResponse<T>(response: Response): Promise<T> {
  return response.text().then((text: string) => {
    const data = getJsonOrText(text);

    if (!response.ok) {
      if (response.status >= 300) {
        // eslint-disable-next-line
        console.error('Response error:', response);
      }

      if (data && data.error) {
        // api errors!
        return Promise.reject();
      }

      const error = data
        ? { ...data, status: response.status }
        : response.status;
      return Promise.reject(error);
    }

    return data;
  });
}

export async function fetchGet<T>(url: string, options: FetchOptions = {}) {
  const requestOptions = {
    method: 'GET',
    headers: options?.headers,
  };

  const response = await fetch(url, requestOptions);

  return handleResponse<T>(response);
}
