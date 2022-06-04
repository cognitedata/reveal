import { showErrorMessage } from '../../../../components/Toast';
import { log } from '../../../../utils/log';
import { MutateUpdateFeedback } from '../types';

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
