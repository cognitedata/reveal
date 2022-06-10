import { feedback } from 'domain/feedback/service/network/service';

import { useMutation, useQueryClient } from 'react-query';

import { FeedbackPostBody } from '@cognite/discover-api-types';

import { FEEDBACK_QUERY_KEY } from '../../../../constants/react-query';
import { useJsonHeaders } from '../../../../services/service';
import { FeedbackType } from '../types';

export function useFeedbackCreateMutate(endpoint: FeedbackType = 'general') {
  const queryClient = useQueryClient();
  const headers = useJsonHeaders({}, true);

  return useMutation(
    (payload: FeedbackPostBody) => feedback.create(endpoint, payload, headers),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(FEEDBACK_QUERY_KEY.ALL(endpoint));
      },
    }
  );
}
