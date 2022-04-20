export const TOGGLE_DELETED_FEEDBACK = 'TOGGLE_DELETE_FEEDBACK';

// Object feedback modal visibility
export const SET_OBJECT_FEEDBACK_MODAL_DOCUMENT_ID =
  'objectFeedback/setObjectFeedbackModalDocumentId';

export const CLEAR_OBJECT_FEEDBACK_MODAL_DOCUMENT_ID =
  'objectFeedback/clearObjectFeedbackModalDocumentId';

export interface FeedbackState {
  generalFeedbackShowDeleted: boolean;
  // Object feedback
  objectFeedbackShowDeleted: boolean;
  objectFeedbackModalDocumentId?: string;
}

export interface SetObjectFeedbackModalDocumentId {
  type: typeof SET_OBJECT_FEEDBACK_MODAL_DOCUMENT_ID;
  payload: string | undefined;
}

export interface ClearObjectFeedbackModalDocumentId {
  type: typeof CLEAR_OBJECT_FEEDBACK_MODAL_DOCUMENT_ID;
}

export interface ToggleDeletedFeedback {
  type: typeof TOGGLE_DELETED_FEEDBACK;
}

export type FeedbackAction =
  | SetObjectFeedbackModalDocumentId
  | ClearObjectFeedbackModalDocumentId
  | ToggleDeletedFeedback;
