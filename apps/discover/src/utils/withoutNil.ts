import isNil from 'lodash/isNil';

export const withoutNil = <T>(data: (T | null | undefined)[]): T[] => {
  return data.filter((dataElement) => !isNil(dataElement)) as T[];
};
