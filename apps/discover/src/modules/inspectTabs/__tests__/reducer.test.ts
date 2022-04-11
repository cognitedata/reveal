import get from 'lodash/get';

import { FILTER_NAMES, MODULES } from '../constants';
import { inspectTabs, initialState } from '../reducer';
import {
  InspectTabsAction,
  SET_FILTER_VALUES,
  SET_SELECTED_ID_MAP,
  SET_ERRORS,
  RESET_ERRORS,
  Errors,
} from '../types';

describe('inspectTabs.reducer', () => {
  test('returns initial state', () => {
    expect(inspectTabs(undefined, {} as InspectTabsAction)).toBeDefined();
  });

  it(`should set filter values ${SET_FILTER_VALUES}`, () => {
    const filter = {
      filterModule: MODULES.nds,
      filterName: FILTER_NAMES.probability,
    };
    const values = ['A', 'B'];
    const state = inspectTabs(
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
    const state = inspectTabs(
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

  it('Should set errors into the state with no other errors', () => {
    const values: Errors = {
      wellbore1: [{ value: 'Error 1' }, { value: 'Error 2' }],
    };
    const state = inspectTabs(
      { ...initialState },
      {
        type: SET_ERRORS,
        values,
      }
    );
    expect(state.errors).toEqual(values);
  });

  it('Should set errors into the state with other wellbore errors', () => {
    const values: Errors = {
      wellbore1: [
        { value: 'Wellbore 1 Error 1' },
        { value: 'Wellbore 1 Error 2' },
      ],
    };
    const state = inspectTabs(
      {
        ...initialState,
        errors: {
          wellbore2: [{ value: 'Wellbore 2 Error 2' }],
        },
      },
      {
        type: SET_ERRORS,
        values,
      }
    );
    expect(state.errors.wellbore1).toEqual(values.wellbore1);
  });

  it('Should update same wellbore errors', () => {
    const values: Errors = {
      wellbore1: [{ value: 'Wellbore 1 Error 2' }],
    };
    const state = inspectTabs(
      {
        ...initialState,
        errors: {
          wellbore1: [{ value: 'Wellbore 1 Error 1' }],
        },
      },
      {
        type: SET_ERRORS,
        values,
      }
    );
    expect(state.errors.wellbore1).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: 'Wellbore 1 Error 1' }),
        expect.objectContaining({ value: 'Wellbore 1 Error 2' }),
      ])
    );
  });

  it('Should reset errors from state', () => {
    const errors: Errors = {
      wellbore1: [{ value: 'Wellbore 1 Error 2' }],
    };
    const state = inspectTabs(
      { ...initialState, errors },
      {
        type: RESET_ERRORS,
      }
    );
    expect(state.errors).toEqual({});
  });
});
