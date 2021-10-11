import { createMockStore } from '__test-utils/store.utils';

import {
  setDocumentSortField,
  setDocumentSortAscending,
  toggleDocumentSubmittedByMe,
  resetDocumentTypeFields,
  clearSearchDocumentType,
} from '../actions';
import {
  SORT_FIELD_DOCUMENT,
  SORT_ASCENDING_DOCUMENT,
  TOGGLE_SUBMITTEDBYME_DOCUMENT,
  RESET_DOCUMENT_TYPE_FIELDS,
  CLEAR_SEARCH_DOCUMENT_FEEDBACK,
} from '../types';

describe('Crowdsourcing Actions', () => {
  it(`should set sortfield to title`, () => {
    const expectedActions = [{ type: SORT_FIELD_DOCUMENT, field: 'title' }];
    const store: any = createMockStore();

    store.dispatch(setDocumentSortField('title'));

    expect(store.getActions()).toEqual(expectedActions);
  });

  it(`should set ascending to true`, () => {
    const expectedActions = [{ type: SORT_ASCENDING_DOCUMENT, asc: true }];
    const store: any = createMockStore();

    store.dispatch(setDocumentSortAscending(true));

    expect(store.getActions()).toEqual(expectedActions);
  });

  it(`should toggle submitted by me`, () => {
    const expectedActions = [{ type: TOGGLE_SUBMITTEDBYME_DOCUMENT }];
    const store: any = createMockStore();

    store.dispatch(toggleDocumentSubmittedByMe());

    expect(store.getActions()).toEqual(expectedActions);
  });

  it(`should reset fields`, () => {
    const expectedActions = [{ type: RESET_DOCUMENT_TYPE_FIELDS }];
    const store: any = createMockStore();

    store.dispatch(resetDocumentTypeFields());

    expect(store.getActions()).toEqual(expectedActions);
  });

  it(`should clear search`, () => {
    const expectedActions = [{ type: CLEAR_SEARCH_DOCUMENT_FEEDBACK }];
    const store: any = createMockStore();

    store.dispatch(clearSearchDocumentType());

    expect(store.getActions()).toEqual(expectedActions);
  });
});
