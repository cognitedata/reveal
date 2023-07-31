import isUndefined from 'lodash/isUndefined';

import { PropertyFilter } from '@cognite/sdk-wells';

export const toPropertyFilter = (values?: string[]): PropertyFilter => {
  if (isUndefined(values)) {
    return {};
  }

  return {
    isSet: true,
    oneOf: values,
  };
};
