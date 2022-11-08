import { selector, useRecoilState, useResetRecoilState } from 'recoil';

import { globalFilterAtom } from '../atoms';
import { GlobalFilter } from '../types';
import { defaultFilterSetter } from '../utils';

const globalDocumentFilters = selector<GlobalFilter['filters']['document']>({
  key: 'GlobalDocumentFilters',
  get: ({ get }) => {
    const {
      filters: { document, common },
    } = get(globalFilterAtom);

    return { ...common, ...document };
  },
  set: defaultFilterSetter('document'),
});
export const useDocumentFilters = () => useRecoilState(globalDocumentFilters);
export const useResetDocumentFilters = () =>
  useResetRecoilState(globalDocumentFilters);
