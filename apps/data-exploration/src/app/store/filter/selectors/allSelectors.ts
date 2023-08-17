import {
  DefaultValue,
  selectorFamily,
  useRecoilValue,
  useResetRecoilState,
  useSetRecoilState,
} from 'recoil';

import {
  FilterResourceType,
  FilterState,
  Filters,
} from '@data-exploration-lib/core';

import { globalFilterAtom } from '../atoms';
import { GlobalFilterKeys } from '../types';
import { defaultFilterSetter } from '../utils';

const globalAllFilters = selectorFamily<any, GlobalFilterKeys | undefined>({
  key: 'GlobalSequenceFilters',
  get:
    (_id) =>
    ({ get }) => {
      const {
        filters: { common, ...allFilters },
      } = get(globalFilterAtom);

      const transformedFilters = Object.keys(allFilters).reduce((acc, item) => {
        return {
          ...acc,
          [item]: {
            ...common,
            ...allFilters[item as keyof Filters],
          },
        };
      }, {} as Filters);

      return { common, ...transformedFilters };
    },
  set: (id) => defaultFilterSetter(id),
});

export const useAllFilters = () => {
  const state = useRecoilValue(globalAllFilters(undefined)) as FilterState;

  const setCommonFilter = useSetRecoilState(globalAllFilters('common'));
  const setAssetFilter = useSetRecoilState(globalAllFilters('asset'));
  const setEventFilter = useSetRecoilState(globalAllFilters('event'));
  const setTimeseriesFilter = useSetRecoilState(globalAllFilters('timeSeries'));
  const setSequenceFilter = useSetRecoilState(globalAllFilters('sequence'));
  const setDocumentFilter = useSetRecoilState(globalAllFilters('document'));
  const setFilesFilter = useSetRecoilState(globalAllFilters('file'));

  const resetCommonFilter = useResetRecoilState(globalAllFilters('common'));
  const resetAssetFilter = useResetRecoilState(globalAllFilters('asset'));
  const resetEventFilter = useResetRecoilState(globalAllFilters('event'));
  const resetTimeseriesFilter = useResetRecoilState(
    globalAllFilters('timeSeries')
  );
  const resetSequenceFilter = useResetRecoilState(globalAllFilters('sequence'));
  const resetDocumentFilter = useResetRecoilState(globalAllFilters('document'));
  const resetFileFilter = useResetRecoilState(globalAllFilters('file'));

  return {
    state,
    setter: (
      resourceType: FilterResourceType,
      nextValue: FilterState[keyof FilterState] | DefaultValue
    ) => {
      switch (resourceType) {
        case 'common':
          return setCommonFilter(nextValue);
        case 'event':
          return setEventFilter(nextValue);
        case 'asset':
          return setAssetFilter(nextValue);
        case 'timeSeries':
          return setTimeseriesFilter(nextValue);
        case 'file':
          return setFilesFilter(nextValue);
        case 'document':
          // Toggle between SAPC here
          // setFileFilter(...)
          return setDocumentFilter(nextValue);
        case 'sequence':
          return setSequenceFilter(nextValue);
        default:
          break;
      }
    },
    resetter: (resourceType: FilterResourceType) => {
      switch (resourceType) {
        case 'common':
          return resetCommonFilter();
        case 'event':
          return resetEventFilter();
        case 'asset':
          return resetAssetFilter();
        case 'timeSeries':
          return resetTimeseriesFilter();
        case 'document':
          return resetDocumentFilter();
        case 'file': {
          resetDocumentFilter();
          resetFileFilter();
          break;
        }
        case 'sequence':
          return resetSequenceFilter();
        default:
          break;
      }
    },
  };
};
