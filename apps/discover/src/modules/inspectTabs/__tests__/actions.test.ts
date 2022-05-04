import { createMockStore } from '__test-utils/store.utils';

import {
  setNdsRiskType,
  setNdsProbability,
  setNdsSeverity,
  setNptDuration,
  setSelectedTrajectoryWellboreIds,
  setErrors,
  resetErrors,
} from '../actions';
import {
  SET_ERRORS,
  Errors,
  RESET_ERRORS,
  SET_NDS_RISK_TYPE,
  SET_NDS_PROBABILITY,
  SET_NDS_SEVERITY,
  SET_NPT_DURATION,
  SET_SELECTED_TRAJECTORY_WELLBORE_IDS,
} from '../types';

describe('Filter data Actions', () => {
  it(`should set NDS RiskType`, () => {
    const payload = ['A', 'B'];
    const expectedActions = { type: SET_NDS_RISK_TYPE, payload };

    const store = createMockStore();

    store.dispatch(setNdsRiskType(payload));

    expect(store.getActions()).toEqual([expectedActions]);
  });

  it(`should set NDS Probability`, () => {
    const payload = ['A', 'B'];
    const expectedActions = { type: SET_NDS_PROBABILITY, payload };

    const store = createMockStore();

    store.dispatch(setNdsProbability(payload));

    expect(store.getActions()).toEqual([expectedActions]);
  });

  it(`should set NDS Severity`, () => {
    const payload = ['A', 'B'];
    const expectedActions = { type: SET_NDS_SEVERITY, payload };

    const store = createMockStore();

    store.dispatch(setNdsSeverity(payload));

    expect(store.getActions()).toEqual([expectedActions]);
  });

  it(`should set NPT duration`, () => {
    const payload = [1, 2];
    const expectedActions = { type: SET_NPT_DURATION, payload };

    const store = createMockStore();

    store.dispatch(setNptDuration(payload));

    expect(store.getActions()).toEqual([expectedActions]);
  });

  it(`should set selected trajectory wellbores`, () => {
    const payload = { 1: true };
    const expectedActions = {
      type: SET_SELECTED_TRAJECTORY_WELLBORE_IDS,
      payload,
    };

    const store = createMockStore();

    store.dispatch(setSelectedTrajectoryWellboreIds(payload));

    expect(store.getActions()).toEqual([expectedActions]);
  });

  it('Should set errors into the state', () => {
    const errors: Errors = {
      wellbore1: [{ value: 'Error 1' }, { value: 'Error 2' }],
    };
    const expectedActions = { type: SET_ERRORS, payload: errors };

    const store = createMockStore();

    store.dispatch(setErrors(errors));

    expect(store.getActions()).toEqual([expectedActions]);
  });

  it('Should reset errors into the state', () => {
    const expectedActions = { type: RESET_ERRORS };

    const store = createMockStore({
      inspectTabs: {
        errors: {
          wellbore1: [{ value: 'Error 1' }, { value: 'Error 2' }],
        },
      },
    });

    store.dispatch(resetErrors());

    expect(store.getActions()).toEqual([expectedActions]);
  });
});
