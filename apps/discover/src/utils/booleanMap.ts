import pickBy from 'lodash/pickBy';

export type BooleanMap = Record<string | number, boolean>;

export const toBooleanMap = (
  list: (number | string)[],
  status = true
): BooleanMap => {
  return list.reduce(
    (booleanMap, key) => ({
      ...booleanMap,
      [key]: status,
    }),
    {} as BooleanMap
  );
};

export const getTruthyValues = (booleanMap: BooleanMap) => {
  return Object.keys(pickBy(booleanMap));
};
