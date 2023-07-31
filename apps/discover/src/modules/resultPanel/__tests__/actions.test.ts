import { Modules } from 'modules/sidebar/types';

import {
  setSortByOptions,
  setResultPanelWidth,
  setActivePanel,
} from '../actions';
import {
  SET_SORT_BY_OPTIONS,
  SET_RESULT_PANEL_WIDTH,
  SET_ACTIVE_PANEL,
} from '../constants';

describe('Test action generators', () => {
  test('Generate set sortBy options action', () => {
    expect(setSortByOptions({ documents: [] })).toEqual({
      type: SET_SORT_BY_OPTIONS,
      payload: { documents: [] },
    });
  });

  test('Generate set result panel width action', () => {
    expect(setResultPanelWidth(50)).toEqual({
      type: SET_RESULT_PANEL_WIDTH,
      payload: 50,
    });
  });

  test('Generate set action panel action', () => {
    expect(setActivePanel(Modules.WELLS)).toEqual({
      type: SET_ACTIVE_PANEL,
      payload: Modules.WELLS,
    });
  });
});
