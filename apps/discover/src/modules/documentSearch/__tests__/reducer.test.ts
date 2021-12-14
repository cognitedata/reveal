import {
  getMockDocument,
  getMockDocumentFacets,
} from '__test-utils/fixtures/document';
import {
  // SET_CURRENT_QUERY,
  SET_RESULTS,
  SET_SEARCHING,
  SET_ERROR_MESSAGE,
  ADD_SELECTED_COLUMN,
  REMOVE_SELECTED_COLUMN,
  SET_SELECTED_COLUMN,
  SET_TYPEAHEAD,
  CLEAR_TYPEAHEAD,
  SET_VIEWMODE,
  TOGGLE_SEARH_INFO,
  // TOGGLE_DUPLICATE_DISPLAY,
  ADD_PREVIEW_ENTITY,
  REMOVE_PREVIEW_ENTITY,
  CLEAR_PREVIEW_RESULTS,
  SET_PREVIEW_ENTITIES,
  SET_HOVERED_DOCUMENT,
  UNSET_HOVERED_DOCUMENT,
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

  test(`Reducer key: ${ADD_PREVIEW_ENTITY}`, () => {
    const state = search(
      { ...initialState, previewedEntities: [] },
      {
        type: ADD_PREVIEW_ENTITY,
        entity: getMockDocument({ id: '1', title: 'TEST' }),
      }
    );

    expect(state.previewedEntities).toHaveLength(1);
    expect(state.previewedEntities[0].id).toEqual('1');
    expect(state.previewedEntities[0].title).toEqual('TEST');
  });

  test(`Reducer key: ${REMOVE_PREVIEW_ENTITY}`, () => {
    const state = search(
      {
        ...initialState,
        previewedEntities: [
          getMockDocument({ id: '1', title: 'TEST' }),
          getMockDocument({ id: '2', title: 'TEST2' }),
        ],
      },
      {
        type: REMOVE_PREVIEW_ENTITY,
        entity: getMockDocument({ id: '1', title: 'TEST' }),
      }
    );

    expect(state.previewedEntities).toHaveLength(1);
    expect(state.previewedEntities[0].id).toEqual('2');
    expect(state.previewedEntities[0].title).toEqual('TEST2');
  });

  test(`Reducer key: ${CLEAR_PREVIEW_RESULTS}`, () => {
    const state = search(
      {
        ...initialState,
        previewedEntities: [
          getMockDocument({ id: '1', title: 'TEST' }),
          getMockDocument({ id: '2', title: 'TEST2' }),
        ],
      },
      { type: CLEAR_PREVIEW_RESULTS }
    );
    expect(state.previewedEntities).toHaveLength(0);
  });

  test(`Reducer key: ${SET_PREVIEW_ENTITIES}`, () => {
    const state = search(
      { ...initialState, previewedEntities: [] },
      {
        type: SET_PREVIEW_ENTITIES,
        entities: [getMockDocument({ id: '1', title: 'TEST' })],
      }
    );
    expect(state.previewedEntities).toHaveLength(1);
    expect(state.previewedEntities[0].id).toEqual('1');
    expect(state.previewedEntities[0].title).toEqual('TEST');
  });

  test(`Reducer key: ${SET_TYPEAHEAD}`, () => {
    const state = search(initialState, {
      type: SET_TYPEAHEAD,
      results: ['Lorem ipsum', 'Lorem ipsum dolor at'],
    });
    expect(state.typeAheadResults).toHaveLength(2);
  });

  test(`Reducer key: ${CLEAR_TYPEAHEAD}`, () => {
    const state = search(
      {
        ...initialState,
        typeAheadResults: ['Lorem ipsum', 'Lorem ipsum dolor at'],
      },
      { type: CLEAR_TYPEAHEAD }
    );
    expect(state.typeAheadResults).toHaveLength(0);
  });

  // test.each`
  //   input    | expectedResult
  //   ${true}  | ${true}
  //   ${false} | ${false}
  // `(
  //   `${SET_GROUPSIMILAR_RESULTS} to return $expectedResult`,
  //   ({ input, expectedResult }) => {
  //     const state = search(undefined, {
  //       type: SET_GROUPSIMILAR_RESULTS,
  //       isGroupSimilarResults: input,
  //     });
  //     expect(state.currentDocumentQuery.isGroupSimilarResults).toEqual(
  //       expectedResult
  //     );
  //   }
  // );

  test(`Reducer key: ${SET_RESULTS}`, () => {
    const state = search(
      { ...initialState, isSearching: true },
      {
        type: SET_RESULTS,
        result: {
          count: 3,
          hits: [
            getMockDocument({ id: '1', title: 'TEST' }),
            getMockDocument({ id: '2', title: 'TEST 2' }),
            getMockDocument({ id: '3', title: 'TEST 3' }),
          ],
          facets: getMockDocumentFacets(),
        },
      }
    );
    expect(state.isSearching).toEqual(false);
    expect(state.result.count).toEqual(3);
    expect(state.result.hits).toHaveLength(3);
  });

  test.each`
    input    | expectedResult
    ${true}  | ${true}
    ${false} | ${false}
  `(
    `Reducer key: ${SET_SEARCHING} to return $expectedResult`,
    ({ input, expectedResult }) => {
      const state = search(undefined, {
        type: SET_SEARCHING,
        isSearching: input,
      });
      expect(state.isSearching).toEqual(expectedResult);
    }
  );

  // this has been disabled for now
  // -test(`${SET_CURRENT_QUERY}`, () => {
  //   const query = {
  //     q: 'test',
  //     len: 50,
  //     offset: 2,
  //     facet: { datatype: {} },
  //     page: 1,
  //   };
  //   const state = search(undefined, {
  //     type: SET_CURRENT_QUERY,
  //     query,
  //   });
  //   expect(state.currentDocumentQuery).toEqual(query);
  // });

  // this has been disabled for now
  // -test(`${TOGGLE_DUPLICATE_DISPLAY}`, () => {
  //   const state = search(
  //     { result: { hits: [{ id: 1, isOpen: false }, { id: 2 }] } },
  //     {
  //       type: TOGGLE_DUPLICATE_DISPLAY,
  //       isOpen: true,
  //       hit: { id: 1 },
  //     }
  //   );
  //   const hit = state.result.hits.find((l) => l.id === 1);
  //   expect(hit.isOpen).toEqual(true);
  // });

  test(`Reducer key: ${SET_VIEWMODE}`, () => {
    const state = search(undefined, {
      type: SET_VIEWMODE,
      viewMode: 'card',
    });
    expect(state.viewMode).toEqual('card');
  });

  test(`Reducer key: ${TOGGLE_SEARH_INFO}`, () => {
    const state = search(undefined, {
      type: TOGGLE_SEARH_INFO,
      display: true,
    });
    expect(state.displayInformationModal).toEqual(true);
  });

  test(`Reducer key: ${SET_ERROR_MESSAGE}`, () => {
    const state = search(undefined, {
      type: SET_ERROR_MESSAGE,
      message: 'Test message',
    });
    expect(state.errorMessage).toEqual('Test message');
  });

  it(`Add to selected document ids`, () => {
    const documentIdToAdd = '778781654822069';
    const state = search(
      {
        ...initialState,
        result: {
          hits: [
            getMockDocument({ id: '778781654822070' }),
            getMockDocument({ id: '778781654822071' }),
          ],
          count: 2,
          facets: getMockDocumentFacets(),
        },
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
        result: {
          hits: [
            getMockDocument({ id: '778781654822070' }),
            getMockDocument({ id: '778781654822071' }),
          ],
          count: 2,
          facets: getMockDocumentFacets(),
        },
        selectedDocumentIds: ['778781654822070', '778781654822071'],
      },
      {
        type: UNSELECT_DOCUMENT_IDS,
        ids: [documentIdToRemove],
      }
    );
    expect(state.selectedDocumentIds).toEqual(['778781654822071']);
  });

  it(`Add hovered document id to state`, () => {
    const documentIdToAdd = '778781654822069';
    const state = search(
      {
        ...initialState,
        result: {
          hits: [
            getMockDocument({ id: '778781654822069' }),
            getMockDocument({ id: '778781654822071' }),
          ],
          count: 2,
          facets: getMockDocumentFacets(),
        },
      },
      {
        type: SET_HOVERED_DOCUMENT,
        id: documentIdToAdd,
      }
    );
    expect(state.hoveredDocumentId).toEqual(documentIdToAdd);
  });

  it(`Unset hovered document id from state`, () => {
    const state = search(
      {
        ...initialState,
        result: {
          hits: [
            getMockDocument({ id: '778781654822069' }),
            getMockDocument({ id: '778781654822071' }),
          ],
          count: 2,
          facets: getMockDocumentFacets(),
        },
        hoveredDocumentId: '778781654822069',
      },
      {
        type: UNSET_HOVERED_DOCUMENT,
      }
    );
    expect(state.hoveredDocumentId).toEqual(undefined);
  });
});
