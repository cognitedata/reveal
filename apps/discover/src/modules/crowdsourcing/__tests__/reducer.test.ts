import { crowdsourcing, intialState } from '../reducer';
import {
  SORT_FIELD_DOCUMENT,
  SORT_ASCENDING_DOCUMENT,
  TOGGLE_SUBMITTEDBYME_DOCUMENT,
  RESET_DOCUMENT_TYPE_FIELDS,
  CLEAR_SEARCH_DOCUMENT_FEEDBACK,
} from '../types';

describe('crowdsourcing.reducer', () => {
  test('returns initial state', () => {
    expect(
      crowdsourcing(undefined, {
        type: RESET_DOCUMENT_TYPE_FIELDS,
      })
    ).toBeDefined();
  });

  it(`should set sort field ${SORT_FIELD_DOCUMENT}`, () => {
    const state = crowdsourcing(
      { ...intialState },
      {
        type: SORT_FIELD_DOCUMENT,
        field: 'title',
      }
    );
    expect(state).toEqual({ ...intialState, documentSortField: 'title' });
  });

  it('should set ascending to true', () => {
    const state = crowdsourcing(
      { ...intialState },
      {
        type: SORT_ASCENDING_DOCUMENT,
        asc: true,
      }
    );
    expect(state).toEqual({ ...intialState, documentSortAscending: true });
  });

  it('should toggle TOGGLE_SUBMITTEDBYME_DOCUMENT', () => {
    const state = crowdsourcing(
      { ...intialState },
      {
        type: TOGGLE_SUBMITTEDBYME_DOCUMENT,
      }
    );
    expect(state).toEqual({
      ...intialState,
      documentSubmittedByMe: !intialState.documentSubmittedByMe,
    });
  });

  it('should reset fields', () => {
    const state = crowdsourcing(
      {
        ...intialState,
        documentSortField: 'title',
        documentSortAscending: true,
      },
      {
        type: RESET_DOCUMENT_TYPE_FIELDS,
      }
    );
    expect(state).toEqual({
      ...intialState,
    });
  });

  it('should celar search fields', () => {
    const state = crowdsourcing(
      {
        ...intialState,
        documentSortField: 'title',
        documentSortAscending: true,
      },
      {
        type: CLEAR_SEARCH_DOCUMENT_FEEDBACK,
      }
    );
    expect(state).toEqual({
      ...intialState,
    });
  });
});
