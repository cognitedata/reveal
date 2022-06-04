import { useMutation, useQueryClient } from 'react-query';

import { discoverAPI, useJsonHeaders } from '../../../../services/service';
import { FeedbackPatchBody, FeedbackType } from '../types';

export function useFeedbackUpdateMutate(endpoint: FeedbackType = 'general') {
  const queryClient = useQueryClient();
  const headers = useJsonHeaders({}, true);
  return useMutation(
    (data: FeedbackPatchBody) =>
      discoverAPI.feedback.update(endpoint, data, headers),
    {
      onSuccess: () => {
        // need to load the objects again after updating sensitive data
        const feedbackEndpoint = endpoint === 'sensitive' ? 'object' : endpoint;

        const queriesToInvalidate = ['feedback', feedbackEndpoint, 'getAll'];
        queryClient.invalidateQueries(queriesToInvalidate);
      },
    }
  );
}
