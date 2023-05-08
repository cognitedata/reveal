import isNumber from 'lodash/isNumber';

import { getTooltipNumericValue } from './getTooltipNumericValue';

export const getTooltipRawDatapointValue = (value?: string | number) => {
  if (isNumber(value)) {
    return getTooltipNumericValue(value);
  }

  return value;
};
