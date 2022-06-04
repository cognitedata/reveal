import { useQuery } from 'react-query';

import { FEEDBACK_QUERY_KEY } from 'constants/react-query';

import { discoverAPI, useJsonHeaders } from '../../../../services/service';
import { FeedbackType } from '../types';

export function useFeedbackGetOneQuery<T>(
  endpoint: FeedbackType = 'general',
  id = ''
) {
  const headers = useJsonHeaders({}, true);
  return useQuery(FEEDBACK_QUERY_KEY.ONE(endpoint, id), () =>
    discoverAPI.feedback.getOne<T>(endpoint, id, headers)
  );
}
