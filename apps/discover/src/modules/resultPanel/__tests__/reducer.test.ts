import { Modules } from 'modules/sidebar/types';

import {
  SET_SORT_BY_OPTIONS,
  SET_RESULT_PANEL_WIDTH,
  SET_ACTIVE_PANEL,
} from '../constants';
import { resultPanel as reducer, initialState } from '../reducer';

describe('Test result panel reducer', () => {
  test('returns initial state', () => {
    expect(
      reducer(initialState, {
        type: SET_RESULT_PANEL_WIDTH,
        payload: 100,
      })
    ).toBeDefined();
  });

  test('Set sortBy options', () => {
    const state = reducer(initialState, {
      type: SET_SORT_BY_OPTIONS,
      payload: {
        documents: [],
      },
    });
    expect(state.sortBy).toEqual({ documents: [] });
  });

  test('Set result panel width', () => {
    const state = reducer(initialState, {
      type: SET_RESULT_PANEL_WIDTH,
      payload: 100,
    });
    expect(state.panelWidth).toEqual(100);
  });

  test('Set active panel', () => {
    const state = reducer(initialState, {
      type: SET_ACTIVE_PANEL,
      payload: Modules.WELLS,
    });
    expect(state.activePanel).toEqual(Modules.WELLS);
  });
});
