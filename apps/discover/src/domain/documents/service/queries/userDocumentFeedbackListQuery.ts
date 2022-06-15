import { useQuery } from 'react-query';

import { getTenantInfo } from '@cognite/react-container';

import { DOCUMENT_FEEDBACK_QUERY_KEY } from 'constants/react-query';
import { useJsonHeaders } from 'hooks/useJsonHeaders';

import { getDocumentFeedbacks } from '../network/getDocumentFeedbacks';

export const useDocumentFeedbackListQuery = () => {
  const headers = useJsonHeaders();
  const [project] = getTenantInfo();

  return useQuery(DOCUMENT_FEEDBACK_QUERY_KEY.lists(), () =>
    getDocumentFeedbacks(project, headers)
  );
};
