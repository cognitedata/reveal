import { globalFilterAtom } from 'app/store/filter';
import { GlobalFilter, GlobalFilterKeys } from 'app/store/filter/types';
import { DefaultValue, GetRecoilValue, SetRecoilState } from 'recoil';

const updateFilters = <T>(
  currentFilters: GlobalFilter,
  key: GlobalFilterKeys,
  newValue: T
) => {
  return {
    ...currentFilters,
    filters: {
      ...currentFilters.filters,
      [key]: {
        ...currentFilters.filters[key],
        ...newValue,
      },
    },
  };
};

const clearFilters = (currentFilters: GlobalFilter, key: GlobalFilterKeys) => {
  return {
    ...currentFilters,
    filters: {
      ...currentFilters.filters,
      [key]: {},
    },
  };
};

export const defaultFilterSetter =
  (id: GlobalFilterKeys) =>
  <T>(
    { set, get }: { set: SetRecoilState; get: GetRecoilValue },
    newValue: T
  ) => {
    const currentFilters = get(globalFilterAtom);

    if (newValue instanceof DefaultValue) {
      return set(globalFilterAtom, clearFilters(currentFilters, id));
    }

    return set(globalFilterAtom, updateFilters(currentFilters, id, newValue));
  };
