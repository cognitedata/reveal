import { useMutation, useQueryClient } from 'react-query';

import { FeedbackPostBody } from '@cognite/discover-api-types';

import { FEEDBACK_QUERY_KEY } from 'constants/react-query';

import { discoverAPI, useJsonHeaders } from '../service';

import { FeedbackType, FeedbackPatchBody } from './types';

export function useFeedbackCreateMutate(endpoint: FeedbackType = 'general') {
  const queryClient = useQueryClient();
  const headers = useJsonHeaders({}, true);

  return useMutation(
    (payload: FeedbackPostBody) =>
      discoverAPI.feedback.create(endpoint, payload, headers),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(FEEDBACK_QUERY_KEY.ALL(endpoint));
      },
    }
  );
}

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
