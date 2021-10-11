import { useMutation, useQuery, useQueryClient } from 'react-query';

import { FEEDBACK_QUERY_KEY } from 'constants/react-query';

import { discoverAPI, getJsonHeaders } from '../service';

import { FeedbackType } from './types';

export function useFeedbackCreateMutate(endpoint: FeedbackType = 'general') {
  const queryClient = useQueryClient();
  const headers = getJsonHeaders({}, true);
  const mutation = useMutation(
    (payload: Record<string, unknown>) =>
      discoverAPI.feedback.create(endpoint, payload, headers),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(FEEDBACK_QUERY_KEY.ALL(endpoint));
      },
    }
  );

  return mutation;
}

export function useFeedbackUpdateMutate(endpoint: FeedbackType = 'general') {
  const queryClient = useQueryClient();
  const headers = getJsonHeaders({}, true);
  return useMutation(
    (data: { id: string; payload: Record<string, unknown> }) =>
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

export function useFeedbackGetAllQuery<T>(endpoint: FeedbackType = 'general') {
  const headers = getJsonHeaders({}, true);
  return useQuery(FEEDBACK_QUERY_KEY.ALL(endpoint), () =>
    discoverAPI.feedback.get<T>(endpoint, headers)
  );
}

export function useFeedbackGetOneQuery<T>(
  endpoint: FeedbackType = 'general',
  id: string
) {
  const headers = getJsonHeaders({}, true);
  return useQuery(FEEDBACK_QUERY_KEY.ONE(endpoint, id), () =>
    discoverAPI.feedback.getOne<T>(endpoint, id, headers)
  );
}
