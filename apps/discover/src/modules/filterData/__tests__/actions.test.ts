import { createMockStore } from '__test-utils/store.utils';

import {
  setNdsRiskType,
  setNdsProbability,
  setNdsSeverity,
  setNptDuration,
  setSelectedCasingIds,
  setSelectedTrajectoryWellboreIds,
} from '../actions';
import { FILTER_NAMES, MODULES } from '../constants';
import { SET_FILTER_VALUES, SET_SELECTED_ID_MAP } from '../types';

describe('Filter data Actions', () => {
  it(`should set NDS RiskType`, () => {
    const filter = {
      filterModule: MODULES.nds,
      filterName: FILTER_NAMES.riskType,
    };
    const values = ['A', 'B'];
    const expectedActions = { type: SET_FILTER_VALUES, filter, values };

    const store: any = createMockStore();

    store.dispatch(setNdsRiskType(values));

    expect(store.getActions()).toEqual([expectedActions]);
  });

  it(`should set NDS Probability`, () => {
    const filter = {
      filterModule: MODULES.nds,
      filterName: FILTER_NAMES.probability,
    };
    const values = ['A', 'B'];
    const expectedActions = { type: SET_FILTER_VALUES, filter, values };

    const store: any = createMockStore();

    store.dispatch(setNdsProbability(values));

    expect(store.getActions()).toEqual([expectedActions]);
  });

  it(`should set NDS Severity`, () => {
    const filter = {
      filterModule: MODULES.nds,
      filterName: FILTER_NAMES.severity,
    };
    const values = ['A', 'B'];
    const expectedActions = { type: SET_FILTER_VALUES, filter, values };

    const store: any = createMockStore();

    store.dispatch(setNdsSeverity(values));

    expect(store.getActions()).toEqual([expectedActions]);
  });

  it(`should set NPT duration`, () => {
    const filter = {
      filterModule: MODULES.npt,
      filterName: FILTER_NAMES.duration,
    };
    const values = [1, 2];
    const expectedActions = { type: SET_FILTER_VALUES, filter, values };

    const store: any = createMockStore();

    store.dispatch(setNptDuration(values));

    expect(store.getActions()).toEqual([expectedActions]);
  });

  it(`should set casing selected Ids`, () => {
    const filter = {
      filterModule: MODULES.casing,
      filterName: FILTER_NAMES.selectedIds,
    };
    const values = { 1: true };
    const expectedActions = { type: SET_SELECTED_ID_MAP, filter, values };

    const store: any = createMockStore();

    store.dispatch(setSelectedCasingIds(values));

    expect(store.getActions()).toEqual([expectedActions]);
  });

  it(`should set selected trajectory wellbores`, () => {
    const filter = {
      filterModule: MODULES.trajectory,
      filterName: FILTER_NAMES.selectedWellboreIds,
    };
    const values = { 1: true };
    const expectedActions = { type: SET_SELECTED_ID_MAP, filter, values };

    const store: any = createMockStore();

    store.dispatch(setSelectedTrajectoryWellboreIds(values));

    expect(store.getActions()).toEqual([expectedActions]);
  });
});
