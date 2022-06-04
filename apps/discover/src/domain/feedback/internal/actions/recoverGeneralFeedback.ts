import { log } from '@cognite/react-container';

import { showErrorMessage } from '../../../../components/Toast';
import { MutateUpdateFeedback } from '../types';

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
