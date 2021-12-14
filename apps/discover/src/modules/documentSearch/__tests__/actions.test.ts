import fetchMock from 'fetch-mock';

import { storage } from '@cognite/react-container';

import {
  getMockedStore,
  getInitialStore,
  createMockStore,
} from '__test-utils/store.utils';
import { AppStore } from '__test-utils/types';
import { documentSearchActions } from 'modules/documentSearch/actions';
import {
  ADD_SELECTED_COLUMN,
  REMOVE_SELECTED_COLUMN,
  SET_SELECTED_COLUMN,
} from 'modules/documentSearch/types.actions';

const getStoreWithCustomSearch = (searchOverrides = {}) => {
  const custom = getInitialStore();

  return createMockStore({
    ...custom,
    documentSearch: { ...searchOverrides },
  });
};

describe('Search Actions', () => {
  let store: AppStore;
  beforeEach(() => {
    storage.removeItem('SEARCH_SELECTED_COLUMNS');
    fetchMock.restore();
    store = getMockedStore();
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it(`creates ${SET_SELECTED_COLUMN} when initializing or selecting/deselecting all columns`, () => {
    const columns = ['FILENAME', 'FILESIZE', 'TITLE'];
    const expectedActions = [{ type: SET_SELECTED_COLUMN, columns }];
    store.dispatch(documentSearchActions.setSelectedColumns(columns));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it(`creates ${ADD_SELECTED_COLUMN} when selecting one column`, () => {
    const column = { field: 'FILENAME', name: 'File Name' };
    const expectedActions = [
      { type: ADD_SELECTED_COLUMN, column: column.field },
    ];
    store = getStoreWithCustomSearch({ selectedColumns: [] });
    store.dispatch(documentSearchActions.addSelectedColumn(column));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it(`creates ${REMOVE_SELECTED_COLUMN} when de-selecting one column`, () => {
    const column = { field: 'FILENAME', name: 'File Name' };
    const expectedActions = [
      {
        type: REMOVE_SELECTED_COLUMN,
        column: column.field,
      },
    ];
    store = getStoreWithCustomSearch({
      selectedColumns: ['FILENAME', 'FILESIZE', 'TITLE'],
    });
    store.dispatch(documentSearchActions.removeSelectedColumn(column));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it(`should successfully initializing app with default values`, async () => {
    const expectedActions = [
      {
        type: SET_SELECTED_COLUMN,
        columns: [
          'filename',
          'creationdate',
          'lastmodified',
          'location',
          'filetype',
          'labels',
          'author',
        ],
      },
    ];
    store.dispatch(documentSearchActions.initialize());
    expect(store.getActions()).toEqual(expectedActions);
  });

  it(`should successfully initializing app`, async () => {
    storage.setItem('SEARCH_SELECTED_COLUMNS', [
      'filename',
      'lastmodified',
      'location',
    ]);

    const expectedActions = [
      {
        type: SET_SELECTED_COLUMN,
        columns: ['filename', 'lastmodified', 'location'],
      },
    ];
    store.dispatch(documentSearchActions.initialize());

    expect(store.getActions()).toEqual(expectedActions);
  });
});
