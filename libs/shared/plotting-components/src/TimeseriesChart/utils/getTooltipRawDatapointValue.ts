import isNumber from 'lodash/isNumber';

export const getTooltipRawDatapointValue = (value?: string | number) => {
  if (isNumber(value)) {
    return value.toFixed(3);
  }

  return value;
};
