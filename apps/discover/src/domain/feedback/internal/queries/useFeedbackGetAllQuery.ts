import { feedback } from 'domain/feedback/service/network/service';

import { useQuery } from 'react-query';

import { FEEDBACK_QUERY_KEY } from '../../../../constants/react-query';
import { useJsonHeaders } from '../../../../hooks/useJsonHeaders';
import { FeedbackType } from '../types';

export function useFeedbackGetAllQuery<T>(endpoint: FeedbackType = 'general') {
  const headers = useJsonHeaders({}, true);
  return useQuery(FEEDBACK_QUERY_KEY.ALL(endpoint), () =>
    feedback.get<T>(endpoint, headers)
  );
}
