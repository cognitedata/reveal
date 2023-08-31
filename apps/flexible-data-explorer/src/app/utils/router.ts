import isEmpty from 'lodash/isEmpty';
import isObject from 'lodash/isObject';

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
