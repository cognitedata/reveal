import get from 'lodash/get';

import { FILTER_NAMES, MODULES } from '../constants';
import { filterData, initialState } from '../reducer';
import {
  FilterDataAction,
  SET_FILTER_VALUES,
  SET_SELECTED_ID_MAP,
} from '../types';

describe('FilterData.reducer', () => {
  test('returns initial state', () => {
    expect(filterData(undefined, {} as FilterDataAction)).toBeDefined();
  });

  it(`should set filter values ${SET_FILTER_VALUES}`, () => {
    const filter = {
      filterModule: MODULES.nds,
      filterName: FILTER_NAMES.probability,
    };
    const values = ['A', 'B'];
    const state = filterData(
      { ...initialState },
      {
        type: SET_FILTER_VALUES,
        filter,
        values,
      }
    );
    expect(state).toEqual({
      ...initialState,
      [MODULES.nds]: {
        ...get(initialState, MODULES.nds),
        [FILTER_NAMES.probability]: values,
      },
    });
  });

  it(`should set selected Ids ${SET_SELECTED_ID_MAP}`, () => {
    const filter = {
      filterModule: MODULES.casing,
      filterName: FILTER_NAMES.selectedIds,
    };
    const IdMap = { 1: true };
    const state = filterData(
      { ...initialState },
      {
        type: SET_SELECTED_ID_MAP,
        filter,
        values: IdMap,
      }
    );
    expect(state).toEqual({
      ...initialState,
      [MODULES.casing]: {
        ...get(initialState, MODULES.casing),
        [FILTER_NAMES.selectedIds]: IdMap,
      },
    });
  });
});
