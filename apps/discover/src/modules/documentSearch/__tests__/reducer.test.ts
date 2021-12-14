import {
  ADD_SELECTED_COLUMN,
  REMOVE_SELECTED_COLUMN,
  SET_SELECTED_COLUMN,
  SET_VIEWMODE,
  SELECT_DOCUMENT_IDS,
  UNSELECT_DOCUMENT_IDS,
} from 'modules/documentSearch/types.actions';

import { initialState, search } from '../reducer';

describe('search.reducer', () => {
  test('returns initial state', () => {
    expect(search()).toBeDefined();
  });

  test(`Reducer key: ${ADD_SELECTED_COLUMN}`, () => {
    const state = search(
      { ...initialState, selectedColumns: [] },
      { type: ADD_SELECTED_COLUMN, column: 'FILENAME' }
    );
    expect(state.selectedColumns).toContain('FILENAME');
    expect(state.selectedColumns).toHaveLength(1);
  });

  test(`Reducer key: ${REMOVE_SELECTED_COLUMN}`, () => {
    const state = search(
      { ...initialState, selectedColumns: ['FILENAME', 'TITLE', 'FILESIZE'] },
      { type: REMOVE_SELECTED_COLUMN, column: 'FILENAME' }
    );
    expect(state.selectedColumns).not.toContain('FILENAME');
    expect(state.selectedColumns).toHaveLength(2);
  });

  test(`Reducer key: ${SET_SELECTED_COLUMN}`, () => {
    const state = search(
      { ...initialState, selectedColumns: ['FILENAME', 'TITLE', 'FILESIZE'] },
      {
        type: SET_SELECTED_COLUMN,
        columns: ['FILENAME', 'FILESIZE'],
      }
    );
    expect(state.selectedColumns).not.toContain('TITLE');
    expect(state.selectedColumns).toContain('FILENAME');
    expect(state.selectedColumns).toContain('FILESIZE');
    expect(state.selectedColumns).toHaveLength(2);
  });

  test(`Reducer key: ${SET_VIEWMODE}`, () => {
    const state = search(undefined, {
      type: SET_VIEWMODE,
      viewMode: 'card',
    });
    expect(state.viewMode).toEqual('card');
  });

  it(`Add to selected document ids`, () => {
    const documentIdToAdd = '778781654822069';
    const state = search(
      {
        ...initialState,
        selectedDocumentIds: [],
      },
      {
        type: SELECT_DOCUMENT_IDS,
        ids: [documentIdToAdd],
      }
    );
    expect(state.selectedDocumentIds).toEqual([documentIdToAdd]);
  });

  it(`Remove selected document id from state`, () => {
    const documentIdToRemove = '778781654822070';
    const state = search(
      {
        ...initialState,
        selectedDocumentIds: ['778781654822070', '778781654822071'],
      },
      {
        type: UNSELECT_DOCUMENT_IDS,
        ids: [documentIdToRemove],
      }
    );
    expect(state.selectedDocumentIds).toEqual(['778781654822071']);
  });
});
