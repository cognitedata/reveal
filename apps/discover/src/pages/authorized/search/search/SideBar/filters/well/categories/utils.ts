import { WellFilterOptionValue } from 'modules/wellSearch/types';

export const restFilters = <T extends WellFilterOptionValue>(
  source: T[],
  target: T[]
) => {
  return source.filter((item) => !target.includes(item));
};
