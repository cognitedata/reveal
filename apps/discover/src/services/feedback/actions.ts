import isUndefined from 'lodash/isUndefined';
import { getEmail } from 'utils/getCogniteSDKClient';
import { log } from 'utils/log';

import { GeneralFeedback, ObjectFeedback } from '@cognite/discover-api-types';

import { showErrorMessage } from 'components/toast';
import { FEEDBACK_ERROR_MESSAGE } from 'constants/feedback';
import { APP_EMAIL } from 'constants/general';
import { STATUS } from 'modules/feedback/constants';

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

export function sendObjectFeedback(
  feedback: ObjectFeedback,
  mutate: MutateCreateFeedback
) {
  const newDocumentFeedbackItem: ObjectFeedback = {
    ...feedback,
    status: 0,
    deleted: false,
  };

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore this is a check for a old unmigrated value
  if (!newDocumentFeedbackItem.query) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore this is a check for a old unmigrated value
    delete newDocumentFeedbackItem.query;
  }

  mutate({ payload: newDocumentFeedbackItem }).catch((error: any) => {
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
  mutate: MutateUpdateFeedback,
  userId?: string
) {
  if (!isUndefined(userId)) {
    return mutate({ id, payload: { assignedTo: userId } }).catch((error) => {
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

  const feedback: GeneralFeedback = {
    user: email,
    comment: comment || '',
    screenshotB64: image,
    status: 0,
    deleted: false,
  };

  return mutate({ payload: feedback }).catch(() => {
    showErrorMessage(FEEDBACK_ERROR_MESSAGE);
  });
}
