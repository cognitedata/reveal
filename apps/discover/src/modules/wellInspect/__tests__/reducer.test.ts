import { initialState, wellInspect } from '../reducer';
import {
  SET_INSPECT_SIDEBAR_WIDTH,
  SET_SELECTED_RELATED_DOCUMENT_COLUMNS,
} from '../types';

describe('Well inspect Reducer', () => {
  it(`should set npt table visited ${SET_INSPECT_SIDEBAR_WIDTH}`, () => {
    const width = 400;
    const state = wellInspect(initialState, {
      type: SET_INSPECT_SIDEBAR_WIDTH,
      payload: width,
    });
    expect(state.inspectSidebarWidth).toEqual(width);
  });

  it(`should set selected related documents columns`, () => {
    const payload = { fileName: true };
    const state = wellInspect(undefined, {
      type: SET_SELECTED_RELATED_DOCUMENT_COLUMNS,
      payload,
    });
    expect(state.selectedRelatedDocumentsColumns.fileName).toBeTruthy();
  });
});
