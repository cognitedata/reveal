import { useQuery } from 'react-query';

import { getTenantInfo } from '@cognite/react-container';

import { DOCUMENT_FEEDBACK_QUERY_KEY } from 'constants/react-query';
import { useJsonHeaders } from 'modules/api/service';

import { listDocumentFeedbacks } from './service';

export const useDocumentFeedbackListQuery = () => {
  const headers = useJsonHeaders();
  const [project] = getTenantInfo();

  return useQuery(DOCUMENT_FEEDBACK_QUERY_KEY.lists(), () =>
    listDocumentFeedbacks(project, headers)
  );
};
