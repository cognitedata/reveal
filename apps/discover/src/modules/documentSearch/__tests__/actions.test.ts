import fetchMock from 'fetch-mock';

import { storage } from '@cognite/react-container';

import { getMockDocument } from '__test-utils/fixtures/document';
import {
  getMockedStore,
  getInitialStore,
  createMockStore,
} from '__test-utils/store.utils';
import { AppStore } from '__test-utils/types';
import { documentSearchActions } from 'modules/documentSearch/actions';
import {
  SET_SEARCHING,
  ADD_SELECTED_COLUMN,
  REMOVE_SELECTED_COLUMN,
  SET_SELECTED_COLUMN,
  SET_CURRENT_PAGE,
  SET_TYPEAHEAD,
  CLEAR_TYPEAHEAD,
  ADD_PREVIEW_ENTITY,
  REMOVE_PREVIEW_ENTITY,
  SET_PREVIEW_ENTITIES,
  SET_LOADING,
  SET_ERROR_MESSAGE,
  SET_RESULTS,
} from 'modules/documentSearch/types.actions';

const getStoreWithCustomSearch = (searchOverrides = {}) => {
  const custom = getInitialStore();

  return createMockStore({
    ...custom,
    documentSearch: {
      ...custom.search,
      ...searchOverrides,
    },
  });
};

const getCustomQuery = (extras = {}) => {
  return {
    currentDocumentQuery: {
      geoFilter: [],
      facets: {},
      phrase: 'test',
      isGroupSimilarResults: false,
      ...extras,
    },
  };
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

  it(`should dispatch ${SET_TYPEAHEAD} when requesting typeahead results`, async () => {
    const expectedActions = [
      { type: SET_TYPEAHEAD, results: expect.anything() },
    ];
    // store = getStoreWithCustomSearch({ isSearching: false });
    await store.dispatch(documentSearchActions.getTypeahead('test'));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it(`creates ${CLEAR_TYPEAHEAD} when clearing typeahead results`, () => {
    const expectedActions = [{ type: CLEAR_TYPEAHEAD }];
    store.dispatch(documentSearchActions.clearTypeahead());
    expect(store.getActions()).toEqual(expectedActions);
  });

  it(`creates ${ADD_PREVIEW_ENTITY} when clicking a row in the view`, async () => {
    const document = getMockDocument(
      {
        id: '1',
      },
      {
        title: 'ABC',
      }
    );
    await store.dispatch(documentSearchActions.addToPreviewedEntity(document));
    expect(store.getActions()).toContainEqual({
      type: ADD_PREVIEW_ENTITY,
      entity: document,
    });
  });

  it(`creates ${REMOVE_PREVIEW_ENTITY} when clicking a row in the view`, () => {
    const document = getMockDocument();
    const expectedActions = [{ type: REMOVE_PREVIEW_ENTITY, entity: document }];

    store.dispatch(documentSearchActions.removeFromPreviewedEntity(document));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it(`creates ${SET_PREVIEW_ENTITIES} when clicking a row in the view`, async () => {
    const document = getMockDocument(
      {
        id: '1',
      },
      {
        title: 'ABC',
      }
    );
    await store.dispatch(
      documentSearchActions.setPreviewedEntities([document])
    );
    expect(store.getActions()).toContainEqual({
      type: SET_PREVIEW_ENTITIES,
      entities: [document],
    });
  });

  it(`should dispatch ${SET_CURRENT_PAGE} and run a search when paging`, async () => {
    const page = 2;
    const length = 50;
    store = getStoreWithCustomSearch({
      ...getCustomQuery({ phrase: 'fd' }),

      count: length,
    });

    await store.dispatch(documentSearchActions.setCurrentPage(page));
    const actions = store.getActions();
    expect(actions).toContainEqual({
      type: SET_CURRENT_PAGE,
      page,
    });
    expect(actions).toContainEqual({
      type: SET_SEARCHING,
      isSearching: true,
    });
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

  it(`Should dispatch actions respectively and results too`, async () => {
    const setSearchingToTrue = { type: SET_SEARCHING, isSearching: true };
    const setLoadingToTrue = { type: SET_LOADING, isLoading: true };
    const setMessageEmpty = { type: SET_ERROR_MESSAGE, message: '' };
    const setResults = { type: SET_RESULTS, result: expect.anything() };
    const setSearchingToFalse = { type: SET_LOADING, isLoading: false };
    store = getMockedStore();
    await store.dispatch(
      documentSearchActions.search({ filters: {}, sort: [] })
    );
    expect(store.getActions()).toContainEqual(setSearchingToTrue);
    expect(store.getActions()).toContainEqual(setLoadingToTrue);
    expect(store.getActions()).toContainEqual(setMessageEmpty);
    expect(store.getActions()).toContainEqual(setResults);
    expect(store.getActions()).toContainEqual(setSearchingToFalse);
  });
});
