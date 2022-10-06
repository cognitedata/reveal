import { globalFilterAtom } from 'app/store/filter';
import { GlobalFilter, GlobalFilterKeys } from 'app/store/filter/types';
import { DefaultValue, GetRecoilValue, SetRecoilState } from 'recoil';

const updateGlobalFilters = <T>(
  currentFilters: GlobalFilter,
  key: GlobalFilterKeys,
  value: T
) => {
  return {
    ...currentFilters,
    filters: {
      ...currentFilters.filters,
      [key]: value,
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
      return set(globalFilterAtom, updateGlobalFilters(currentFilters, id, {}));
    }

    return set(
      globalFilterAtom,
      updateGlobalFilters(currentFilters, id, newValue)
    );
  };
