import isNumber from 'lodash/isNumber';
import isUndefined from 'lodash/isUndefined';

import { addUnit } from './addUnit';
import { getTooltipNumericValue } from './getTooltipNumericValue';

export const getTooltipRawDatapointValue = (
  value?: string | number,
  unit?: string
) => {
  if (isUndefined(value)) {
    return undefined;
  }

  if (isNumber(value)) {
    return getTooltipNumericValue(value, unit);
  }

  return addUnit(value, unit);
};
