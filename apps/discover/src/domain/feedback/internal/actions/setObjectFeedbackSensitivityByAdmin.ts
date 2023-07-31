import { STATUS } from '../../../../modules/feedback/constants';
import { log } from '../../../../utils/log';
import { MutateUpdateFeedback } from '../types';

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
