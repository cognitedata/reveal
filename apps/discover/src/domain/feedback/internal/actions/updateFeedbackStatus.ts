import { log } from '@cognite/react-container';

import { MutateUpdateFeedback } from '../types';

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
