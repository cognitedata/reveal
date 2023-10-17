import isEmpty from 'lodash/isEmpty';
import isObject from 'lodash/isObject';
import queryString from 'query-string';

export const createSearchParams = (
  params: Record<string, string | object | undefined>
) => {
  const validatedParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (isEmpty(value)) {
      return;
    }

    if (isObject(value)) {
      validatedParams.set(key, JSON.stringify(value));
    } else {
      validatedParams.set(key, value!);
    }
  });

  return validatedParams;
};

export const splitPathAndParams = (fullPath: string) => {
  const url = queryString.parseUrl(fullPath);
  const params = new URLSearchParams(queryString.stringify(url.query));

  return { path: url.url, params };
};
