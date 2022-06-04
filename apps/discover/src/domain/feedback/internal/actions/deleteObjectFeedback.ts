import { log } from '@cognite/react-container';

import { showErrorMessage } from '../../../../components/Toast';
import { MutateUpdateFeedback } from '../types';

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
