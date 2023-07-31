import { log } from '@cognite/react-container';

import { showErrorMessage } from '../../../../components/Toast';
import { MutateUpdateFeedback } from '../types';

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
