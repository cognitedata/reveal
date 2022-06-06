import { useMutation, useQueryClient } from 'react-query';

import head from 'lodash/head';
import { useJsonHeaders } from 'services/service';

import { getTenantInfo } from '@cognite/react-container';

import { showErrorMessage } from 'components/Toast';
import { LONG_DURATION } from 'components/Toast/constants';
import { DOCUMENT_FEEDBACK_QUERY_KEY } from 'constants/react-query';

import { acceptDocumentFeedback } from '../network/acceptDocumentFeedback';
import { createDocumentFeedback } from '../network/createDocumentFeedback';
import { rejectDocumentFeedback } from '../network/rejectDocumentFeedback';
import { DocumentFeedbackCreateBody, DocumentFeedbackType } from '../types';

export const useDocumentFeedbackMutate = () => {
  const headers = useJsonHeaders();
  const [project] = getTenantInfo();
  const queryClient = useQueryClient();

  return useMutation(
    async (
      data: DocumentFeedbackCreateBody & { type: DocumentFeedbackType }
    ) => {
      const { type, ...payload } = data;

      const createFeedbackResult = await createDocumentFeedback(
        project,
        { items: [payload] },
        headers
      );

      const feedbackId = head(createFeedbackResult.items)?.feedbackId;
      if (!feedbackId) {
        throw new Error('Feedback id not found upon creating feedback');
      }

      const assessmentTypeFn =
        type === 'accept' ? acceptDocumentFeedback : rejectDocumentFeedback;

      return assessmentTypeFn(
        project,
        {
          items: [{ id: feedbackId }],
        },
        headers
      );
    },
    {
      onSuccess: () => {
        return queryClient.invalidateQueries(DOCUMENT_FEEDBACK_QUERY_KEY.all);
      },
      onError: (error: any) => {
        showErrorMessage(error.message, { autoClose: LONG_DURATION });
      },
    }
  );
};
