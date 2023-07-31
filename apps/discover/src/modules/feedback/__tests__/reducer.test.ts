import { feedback } from '../reducer';
import {
  SET_OBJECT_FEEDBACK_MODAL_DOCUMENT_ID,
  TOGGLE_DELETED_FEEDBACK,
} from '../types';

describe('feedback reducer', () => {
  test(`Reducer key: ${SET_OBJECT_FEEDBACK_MODAL_DOCUMENT_ID}`, () => {
    const state = feedback(undefined, {
      type: SET_OBJECT_FEEDBACK_MODAL_DOCUMENT_ID,
      payload: '123',
    });
    expect(state.objectFeedbackModalDocumentId).toBe('123');
  });
  test(`Reducer key: ${SET_OBJECT_FEEDBACK_MODAL_DOCUMENT_ID} undefined`, () => {
    const state = feedback(undefined, {
      type: SET_OBJECT_FEEDBACK_MODAL_DOCUMENT_ID,
      payload: undefined,
    });
    expect(state.objectFeedbackModalDocumentId).toBeUndefined();
  });

  test(`Reducer key: ${TOGGLE_DELETED_FEEDBACK}`, () => {
    const state = feedback(undefined, {
      type: TOGGLE_DELETED_FEEDBACK,
    });
    expect(state.objectFeedbackShowDeleted).toBeTruthy();
    expect(state.generalFeedbackShowDeleted).toBeTruthy();
  });
});
