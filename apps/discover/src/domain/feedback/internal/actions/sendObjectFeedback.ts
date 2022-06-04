import { ObjectFeedback } from '@cognite/discover-api-types';

import { showErrorMessage } from '../../../../components/Toast';
import { APP_EMAIL } from '../../../../constants/general';
import { log } from '../../../../utils/log';
import { MutateCreateFeedback } from '../types';

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
