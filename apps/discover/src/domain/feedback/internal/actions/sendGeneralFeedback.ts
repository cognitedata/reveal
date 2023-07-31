import { GeneralFeedback } from '@cognite/discover-api-types';

import { showErrorMessage } from '../../../../components/Toast';
import { FEEDBACK_ERROR_MESSAGE } from '../../../../constants/feedback';
import { getEmail } from '../../../../utils/getCogniteSDKClient';
import { MutateCreateFeedback } from '../types';

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
