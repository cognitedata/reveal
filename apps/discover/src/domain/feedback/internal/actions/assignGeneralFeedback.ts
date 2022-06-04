import isUndefined from 'lodash/isUndefined';

import { log } from '@cognite/react-container';

import { showErrorMessage } from '../../../../components/Toast';
import { MutateUpdateFeedback } from '../types';

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
