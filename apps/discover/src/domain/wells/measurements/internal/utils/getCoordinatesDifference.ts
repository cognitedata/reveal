import isNil from 'lodash/isNil';

import { EMPTY_ARRAY } from 'constants/empty';

type ValueType = number | null;

export const getCoordinatesDifference = (
  values1?: ValueType[],
  values2?: ValueType[]
): ValueType[] => {
  if (!values1 || !values2 || values1.length !== values2.length) {
    return EMPTY_ARRAY;
  }

  return values1.map((value1, index) => {
    const value2 = values2[index];

    if (isNil(value1) || isNil(value2)) {
      return null;
    }

    return value1 - value2;
  });
};
