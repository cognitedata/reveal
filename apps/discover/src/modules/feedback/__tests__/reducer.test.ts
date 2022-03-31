import { feedback, initialState as defaultInitialState } from '../reducer';
import {
  ADD,
  ADDING,
  FAILED,
  FeedbackState,
  GET_ALL_GENERAL,
  GetAllGeneral,
  SET_ITEM,
  SET_ROWS_PER_PAGE,
  UPDATE_GENERAL,
  SORT_FIELD_GENERAL,
  SORT_ASCENDING_GENERAL,
  TOGGLE_DELETED_GENERAL,
  SORT_FIELD_OBJECT,
  SORT_ASCENDING_OBJECT,
  TOGGLE_DELETED_OBJECT,
  SET_OBJECT_FEEDBACK_MODAL_DOCUMENT_ID,
} from '../types';

const now = new Date().toISOString();

describe('feedback reducer', () => {
  test('returns initial state', () => {
    expect(feedback(undefined)).toBeDefined();
  });

  test(`Reducer key: ${FAILED}`, () => {
    const state = feedback(undefined, { type: FAILED });
    expect(state).toEqual(
      expect.objectContaining({ isLoading: false, item: {}, failed: true })
    );
  });

  test(`Reducer key: ${ADD}`, () => {
    const state = feedback(undefined, { type: ADD });
    expect(state.isLoading).toBe(false);
  });

  test(`Reducer key: ${ADDING}`, () => {
    const state = feedback(undefined, { type: ADDING });
    expect(state.isLoading).toBe(true);
  });

  test(`Reducer key: ${SET_ITEM}`, () => {
    const item = {
      id: '12',
      comment: 'test',
      lastUpdatedTime: now,
      createdTime: now,
    };

    const state = feedback(undefined, {
      type: SET_ITEM,
      item,
    });

    expect(state.item).toEqual(item);
  });

  test(`Reducer key: ${SET_ROWS_PER_PAGE}`, () => {
    const state = feedback(undefined, { type: SET_ROWS_PER_PAGE, number: 23 });
    expect(state.rowsPerPage).toBe(23);
  });

  // GENERAL FEEDBACK
  test('Should get general feedback when passed GET_ALL_GENERAL', () => {
    const initialState = {
      ...defaultInitialState,
      generalFeedback: [],
      numberGeneralFeedback: 0,
      pagesGeneralFeedback: 1,
    };

    const action: GetAllGeneral = {
      type: GET_ALL_GENERAL,
      items: {
        generalFeedbacks: [
          { id: 1, comment: 'Great!!!' },
          { id: 2, comment: 'Horrible!!!' },
        ],
        nResults: 112,
        pageCountTotal: 15,
      },
    };

    const state = feedback(initialState, action);

    expect(state.generalFeedback).toEqual([
      { id: 1, comment: 'Great!!!' },
      { id: 2, comment: 'Horrible!!!' },
    ]);
    expect(state.numberGeneralFeedback).toEqual(112);
    expect(state.pagesGeneralFeedback).toEqual(15);
  });

  test('Should update general feedback when passed with updated item', () => {
    const generalFeedbackItem = {
      id: '1',
      comment: 'Great!!!',
      screenshotB64: 'screenshot',
      createdTime: now,
      lastUpdatedTime: now,
    };
    const initialState: FeedbackState = {
      ...defaultInitialState,
      generalFeedback: [generalFeedbackItem],
      numberGeneralFeedback: 0,
      pagesGeneralFeedback: 1,
    };

    const state = feedback(initialState, {
      type: UPDATE_GENERAL,
      item: {
        ...generalFeedbackItem,
        comment: 'Another Great!!!',
      },
    });

    expect(state.generalFeedback).toEqual([
      expect.objectContaining({ id: '1', comment: 'Another Great!!!' }),
    ]);
  });

  test(`Reducer key: ${SORT_FIELD_GENERAL}`, () => {
    const state = feedback(undefined, {
      type: SORT_FIELD_GENERAL,
      field: 'comment',
    });
    expect(state.generalFeedbackSortField).toBe('comment');
  });

  test(`Reducer key: ${SORT_ASCENDING_GENERAL}`, () => {
    const state = feedback(undefined, {
      type: SORT_ASCENDING_GENERAL,
      asc: true,
    });
    expect(state.generalFeedbackSortAscending).toBe(true);
  });

  test(`Reducer key: ${TOGGLE_DELETED_GENERAL}`, () => {
    const state = feedback(undefined, {
      type: TOGGLE_DELETED_GENERAL,
    });
    expect(state.generalFeedbackShowDeleted).toBe(true);
  });

  // Object feedback

  test(`Reducer key: ${SORT_FIELD_OBJECT}`, () => {
    const state = feedback(undefined, {
      type: SORT_FIELD_OBJECT,
      field: 'comment',
    });
    expect(state.objectFeedbackSortField).toBe('comment');
  });

  test(`Reducer key: ${SORT_ASCENDING_OBJECT}`, () => {
    const state = feedback(undefined, {
      type: SORT_ASCENDING_OBJECT,
      asc: true,
    });
    expect(state.objectFeedbackSortAscending).toBe(true);
  });

  test(`Reducer key: ${TOGGLE_DELETED_OBJECT}`, () => {
    const state = feedback(undefined, {
      type: TOGGLE_DELETED_OBJECT,
    });
    expect(state.objectFeedbackShowDeleted).toBe(true);
  });

  test(`Reducer key: ${SET_OBJECT_FEEDBACK_MODAL_DOCUMENT_ID}`, () => {
    const state = feedback(undefined, {
      type: SET_OBJECT_FEEDBACK_MODAL_DOCUMENT_ID,
      documentId: '123',
    });
    expect(state.objectFeedbackModalDocumentId).toBe('123');
  });
});
