import isUndefined from 'lodash/isUndefined';

import { PropertyFilter } from '@cognite/sdk-wells-v3';

export const toPropertyFilter = (values?: string[]): PropertyFilter => {
  if (isUndefined(values)) {
    return {};
  }

  return {
    isSet: true,
    oneOf: values,
  };
};
