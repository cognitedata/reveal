import {
  EMPTY_LABEL,
  NIL_FILTER_VALUE,
  NOT_SET,
} from '@data-exploration-lib/core';

export const transformOptionsForMultiselectFilter = (
  options: string | string[]
) => {
  if (typeof options === 'string') {
    return [{ label: options, value: options }];
  }
  return options.map((value) => {
    let label = value;

    if (value === NIL_FILTER_VALUE) {
      label = NOT_SET;
    } else if (value === '') {
      label = EMPTY_LABEL;
    }

    return {
      label,
      value,
    };
  });
};
