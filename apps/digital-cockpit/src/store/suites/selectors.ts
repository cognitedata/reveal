import { getCurrentFilter } from 'store/groups/selectors';
import { StoreState } from 'store/types';
import { filterSuitesByGroups } from 'utils/filters';
import maxBy from 'lodash/maxBy';
import { CogniteExternalId } from '@cognite/sdk';
import { createSelector } from 'reselect';

import { ImgUrls, Suite, SuitesTableState, SuitesByKey } from './types';

export const getSuitesTableState = (state: StoreState): SuitesTableState => {
  const { suites: suitesState } = state.suitesTable;
  let suites = (suitesState || []).sort(
    // eslint-disable-next-line no-unsafe-optional-chaining
    (x: Suite, y: Suite) => x?.order - y?.order
  );

  const groupFilter = getCurrentFilter(state);
  if (groupFilter.length) {
    suites = filterSuitesByGroups(suites, groupFilter);
  }

  return { ...state.suitesTable, suites };
};

// returns root suites
export const getRootSuites = (state: StoreState) => {
  const { suites } = getSuitesTableState(state);
  return (suites || []).filter((suite) => !suite?.parent);
};

// returns all suites
export const getSuites = (state: StoreState): Suite[] | null =>
  getSuitesTableState(state).suites;

export const getSuiteByKey =
  (key: string) =>
  (state: StoreState): Suite | undefined =>
    getSuitesTableState(state).suites?.find((suite) => suite.key === key);

export const getImgUrlsState = (state: StoreState): ImgUrls =>
  state.suitesTable.imageUrls;

export const getNextSuiteOrder = (state: StoreState): number => {
  const { suites } = getSuitesTableState(state);
  const lastSuite = maxBy(suites, (suite) => suite.order);
  return lastSuite ? lastSuite.order + 1 : 1;
};

// returns suite hierarchy as an array, element [0] is a root suite
export const getSuitePath = (suiteKey: CogniteExternalId) =>
  createSelector([() => suiteKey, getSuites], (key, suites): Suite[] => {
    if (!suites || !suites?.length) {
      return [];
    }
    const breadbrumbs = [];
    let child: Suite | undefined = suites.find((suite) => key === suite.key);
    if (child) {
      breadbrumbs.push(child);
      while (child && child.parent) {
        // eslint-disable-next-line no-loop-func
        child = suites.find((suite) => suite.key === child?.parent);
        child && breadbrumbs.push(child);
      }
    }

    return breadbrumbs.reverse();
  });

export const suitesByKey = (state: StoreState): SuitesByKey =>
  getSuitesTableState(state).suites?.reduce((acc, suite) => {
    acc[suite.key] = suite;
    return acc;
  }, {} as SuitesByKey) || {};
