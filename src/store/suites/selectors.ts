import { getCurrentFilter } from 'store/groups/selectors';
import { StoreState } from 'store/types';
import { filterSuitesByGroups } from 'utils/filters';
import maxBy from 'lodash/maxBy';
import { ImgUrls, Suite, SuitesTableState } from './types';

export const getSuitesTableState = (state: StoreState): SuitesTableState => {
  const { suites: suitesState } = state.suitesTable;
  let suites = (suitesState || []).sort(
    (x: Suite, y: Suite) => x?.order - y?.order
  );

  const groupFilter = getCurrentFilter(state);
  if (groupFilter.length) {
    suites = filterSuitesByGroups(suites, groupFilter);
  }

  return { ...state.suitesTable, suites };
};

export const getSuites = (state: StoreState): Suite[] | null =>
  getSuitesTableState(state).suites;

export const getBoardsBySuite = (key: string) => (
  state: StoreState
): Suite | undefined =>
  getSuitesTableState(state).suites?.find((suite) => suite.key === key);

export const getImgUrlsState = (state: StoreState): ImgUrls =>
  state.suitesTable.imageUrls;

export const getNextSuiteOrder = (state: StoreState): number => {
  const { suites } = getSuitesTableState(state);
  const lastSuite = maxBy(suites, (suite) => suite.order);
  return lastSuite ? lastSuite.order + 1 : 1;
};
