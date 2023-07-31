import get from 'lodash/get';

import { MODULES } from '../constants';
import { inspectTabs, initialState } from '../reducer';
import {
  InspectTabsAction,
  SET_ERRORS,
  RESET_ERRORS,
  Errors,
  SET_NDS_PROBABILITY,
  SET_SELECTED_LOG_IDS,
} from '../types';

describe('inspectTabs.reducer', () => {
  test('returns initial state', () => {
    expect(inspectTabs(undefined, {} as InspectTabsAction)).toBeDefined();
  });

  it(`should set filter values ${SET_NDS_PROBABILITY}`, () => {
    const payload = ['A', 'B'];
    const state = inspectTabs(
      { ...initialState },
      {
        type: SET_NDS_PROBABILITY,
        payload,
      }
    );
    expect(state).toEqual({
      ...initialState,
      [MODULES.nds]: {
        ...get(initialState, MODULES.nds),
        probability: payload,
      },
    });
  });

  it(`should set selected Ids ${SET_SELECTED_LOG_IDS}`, () => {
    const IdMap = { 1: true };
    const state = inspectTabs(
      { ...initialState },
      {
        type: SET_SELECTED_LOG_IDS,

        payload: IdMap,
      }
    );
    expect(state).toEqual({
      ...initialState,
      [MODULES.log]: {
        ...get(initialState, MODULES.log),
        selectedIds: IdMap,
      },
    });
  });

  it('Should set errors into the state with no other errors', () => {
    const payload: Errors = {
      wellbore1: [{ message: 'Error 1' }, { message: 'Error 2' }],
    };
    const state = inspectTabs(
      { ...initialState },
      {
        type: SET_ERRORS,
        payload,
      }
    );
    expect(state.errors).toEqual(payload);
  });

  it('Should set errors into the state with other wellbore errors', () => {
    const payload: Errors = {
      wellbore1: [
        { message: 'Wellbore 1 Error 1' },
        { message: 'Wellbore 1 Error 2' },
      ],
    };
    const state = inspectTabs(
      {
        ...initialState,
        errors: {
          wellbore2: [{ message: 'Wellbore 2 Error 2' }],
        },
      },
      {
        type: SET_ERRORS,
        payload,
      }
    );
    expect(state.errors.wellbore1).toEqual(payload.wellbore1);
  });

  it('Should update same wellbore errors', () => {
    const payload: Errors = {
      wellbore1: [{ message: 'Wellbore 1 Error 2' }],
    };
    const state = inspectTabs(
      {
        ...initialState,
        errors: {
          wellbore1: [{ message: 'Wellbore 1 Error 1' }],
        },
      },
      {
        type: SET_ERRORS,
        payload,
      }
    );
    expect(state.errors.wellbore1).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: 'Wellbore 1 Error 1' }),
        expect.objectContaining({ message: 'Wellbore 1 Error 2' }),
      ])
    );
  });

  it('Should reset errors from state', () => {
    const errors: Errors = {
      wellbore1: [{ message: 'Wellbore 1 Error 2' }],
    };
    const state = inspectTabs(
      { ...initialState, errors },
      {
        type: RESET_ERRORS,
      }
    );
    expect(state.errors).toEqual({});
  });

  it('Should not have duplicate errors', () => {
    const payload: Errors = {
      wellbore1: [
        { message: 'Wellbore 1 Error 1' },
        { message: 'Wellbore 1 Error 2' },
      ],
    };
    const state = inspectTabs(
      {
        ...initialState,
        errors: {
          wellbore1: [{ message: 'Wellbore 1 Error 1' }],
          wellbore2: [{ message: 'Wellbore 2 Error 2' }],
        },
      },
      {
        type: SET_ERRORS,
        payload,
      }
    );
    expect(state.errors.wellbore1.length).toEqual(2);
  });
});
