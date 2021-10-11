import { getEmail } from '_helpers/getCogniteSDKClient';
import { log } from '_helpers/log';
import { showErrorMessage } from 'components/toast';
import { FEEDBACK_ERROR_MESSAGE } from 'constants/feedback';
import { APP_EMAIL } from 'constants/general';
import { STATUS } from 'modules/feedback/constants';
import {
  DocumentFeedbackItem,
  NewDocumentFeedbackItem,
} from 'modules/feedback/types';
import { User } from 'modules/user/types';

import { MutateCreateFeedback, MutateUpdateFeedback } from './types';

/**
 * This function updates the status of the feedback
 *
 * @param {string} id the unique ID of the feedback.
 * @param {integer} status the integer that corresponds to the constants in 'modules/feedback/constants';
 */
export function updateFeedbackStatus(
  id: string,
  status: number,
  mutate: MutateUpdateFeedback
) {
  return mutate({ id, payload: { status } }).catch((error) => {
    // do generic error handling here
    // any any UI interactions from the component that called this
    log('Error updating general feedback: ', error);
    throw error;
  });
}

/**
 * This function recovers the deleted feedback.
 * @param {string} id The unique id of the general feedback which is to be recovered.
 */
export function recoverGeneralFeedback(
  id: string,
  mutate: MutateUpdateFeedback
) {
  mutate({ id, payload: { deleted: false } }).catch((error) => {
    log('Error updating general feedback: ', error);
    showErrorMessage(error.message);
  });
}

// --------------- OBJECT FEEDBACK ---------------- //
export function sendObjectDocumentTypeFeedback(
  feedback: DocumentFeedbackItem,
  userId: string,
  mutate: MutateCreateFeedback
) {
  const docTypeFeedback = {
    ...feedback,
    user: userId,
  };

  mutate(docTypeFeedback).catch((error) => {
    log(error);
    showErrorMessage(
      `Document function encountered an error. Please contact ${APP_EMAIL}`
    );
  });
}
export function sendObjectFeedback(
  feedback: NewDocumentFeedbackItem,
  mutate: MutateCreateFeedback
) {
  const object: NewDocumentFeedbackItem = {
    ...feedback,
    status: 0,
    deleted: false,
  };

  if (!object.query) {
    delete object.query;
  }

  mutate(object).catch((error: any) => {
    log(error);
    showErrorMessage(
      `Feedback function encountered an error. Please contact ${APP_EMAIL}`
    );
  });
}

/**
 * This function moves the selected Object feedback to the deleted child.
 * @param {string} id The unique id of the object feedback which is to be deleted (logic)
 */
export function deleteObjectFeedback(id: string, mutate: MutateUpdateFeedback) {
  mutate({ id, payload: { deleted: true } }).catch((error) => {
    log('Error updating object feedback: ', error);
    showErrorMessage(error.message);
  });
}

/**
 * This function recovers the deleted feedback.
 * @param {string} id The unique id of the general feedback which is to be recovered.
 */
export function recoverObjectFeedback(
  id: string,
  mutate: MutateUpdateFeedback
) {
  mutate({ id, payload: { deleted: false } }).catch((error) => {
    log('Error updating object feedback: ', error);
    showErrorMessage(error.message);
  });
}

// DOCUMENT REPORTED AS SENSITIVE IS CONFIRMED BY ADMIN AS SENSITIVE AND REINDEXED TO SENSITIVE INDEX
export function setObjectFeedbackSensitivityByAdmin(
  id: string,
  isSensitive: boolean,
  mutate: MutateUpdateFeedback
) {
  mutate({
    id,
    payload: {
      isSensitiveByAdmin: isSensitive,
      status: isSensitive ? STATUS.Resolved : STATUS.Dismissed,
    },
  }).catch((error) => {
    log('Error setting IsSensitiveByAdmin: ', error);
  });
}

/**
 * This function moves the selected General feedback to the deleted child.
 * @param {string} id The unique id of the general feedback which is to be deleted (logic)
 */
export function deleteGeneralFeedback(
  id: string,
  mutate: MutateUpdateFeedback
) {
  mutate({ id, payload: { deleted: true } }).catch((error) => {
    log('Error updating general feedback: ', error);
    showErrorMessage(error.message);
  });
}

/**
 * This function assigns the feedback related to the given id to the authenticated user.
 *
 * @param {string} id - The unique ID of the feedback.
 * @param {User} user - The user object in User type
 * @param {function} mutate - The mutate function
 */
export function assignGeneralFeedback(
  id: string,
  user: User | undefined,
  mutate: MutateUpdateFeedback
) {
  if (user) {
    return mutate({ id, payload: { assignedTo: user.id } }).catch((error) => {
      log('Error updating general feedback: ', error);
      showErrorMessage(error.message);
    });
  }

  showErrorMessage('Cannot get the logged in user');
  return null;
}

/**
 * This function unassigns the feedback.
 *
 * @param {string} id the unique ID of the feedback.
 */
export function unassignGeneralFeedback(
  id: string,
  mutate: MutateUpdateFeedback
) {
  return mutate({ id, payload: { assignedTo: '' } }).catch((error) => {
    log('Error updating general feedback: ', error);
    showErrorMessage(error.message);
  });
}

// ------------- GENERAL FEEDBACK ---------------- //
export function sendGeneralFeedback(
  comment: string,
  image: string,
  mutate: MutateCreateFeedback
) {
  const email = getEmail();

  const feedback = {
    user: email,
    comment: comment || '',
    screenshotB64: image,
    status: 0,
    deleted: false,
  };

  return mutate(feedback).catch(() => {
    showErrorMessage(FEEDBACK_ERROR_MESSAGE);
  });
}
