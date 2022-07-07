import { adaptToDocumentFeedbackPayload } from 'domain/documents/internal/adapters/adaptToDocumentFeedback';
import { adaptLabelNamesToLabelsQuery } from 'domain/labels/internal/transformers/adaptLabelNamesToLabelsQuery';
import { getAllLabelsByQuery } from 'domain/labels/service/network/getAllLabelsByQuery';

import { useMutation, useQueryClient } from 'react-query';

import { getProjectInfo } from '@cognite/react-container';

import { showErrorMessage } from 'components/Toast';
import { LONG_DURATION } from 'components/Toast/constants';
import { DOCUMENT_FEEDBACK_QUERY_KEY } from 'constants/react-query';
import { useJsonHeaders } from 'hooks/useJsonHeaders';

import { acceptDocumentFeedback } from '../network/acceptDocumentFeedback';
import { createDocumentFeedback } from '../network/createDocumentFeedback';
import { rejectDocumentFeedback } from '../network/rejectDocumentFeedback';
import { DocumentFeedbackCreateBody, DocumentFeedbackType } from '../types';

type DocumentFeedbackAssessmentData = {
  type: DocumentFeedbackType;
  originalDocumentType?: string;
  payload: {
    documentId: number;
    labelExternalId: string;
    reporterInfo?: string;
  };
};

export const useDocumentFeedbackMutate = () => {
  const headers = useJsonHeaders();
  const [project] = getProjectInfo();
  const queryClient = useQueryClient();

  const getFeedbackIdOnCreation = async (
    payload: DocumentFeedbackCreateBody[]
  ) => {
    const createFeedbackResult = await createDocumentFeedback(
      project,
      { items: payload },
      headers
    );

    const feedbackIds = createFeedbackResult.items?.map(
      ({ feedbackId }) => feedbackId
    );

    if (feedbackIds === undefined || feedbackIds.length === 0) {
      throw new Error('Feedback id not found upon creating feedback');
    }

    return feedbackIds;
  };

  const applyDocumentFeedback = (type: DocumentFeedbackType, ids: number[]) => {
    const assessmentTypeFn =
      type === 'accept' ? acceptDocumentFeedback : rejectDocumentFeedback;

    return assessmentTypeFn(
      project,
      {
        items: ids.map((id) => ({ id })),
      },
      headers
    );
  };

  const detachPreviousDocumentTypesFromDocument = async (
    type: DocumentFeedbackType,
    originalDocumentType: string | undefined,
    { documentId, reporterInfo }: DocumentFeedbackAssessmentData['payload']
  ) => {
    if (!originalDocumentType) return;

    const originalDocumentTypes = originalDocumentType?.split(', ');

    const matchingLabels = await getAllLabelsByQuery(
      adaptLabelNamesToLabelsQuery(originalDocumentTypes)
    );

    const transformToDocumentFeedbackPayloads = matchingLabels.map(
      ({ externalId }) => {
        return adaptToDocumentFeedbackPayload(
          'DETACH',
          documentId,
          externalId,
          reporterInfo
        );
      }
    );

    const feedbackIds = await getFeedbackIdOnCreation(
      transformToDocumentFeedbackPayloads
    );

    await applyDocumentFeedback(type, feedbackIds);
  };

  return useMutation(
    async (data: DocumentFeedbackAssessmentData) => {
      const { type, originalDocumentType, payload } = data;

      if (type === 'accept') {
        // Detach all the previous labels.
        await detachPreviousDocumentTypesFromDocument(
          type,
          originalDocumentType,
          payload
        );
      }

      const adaptPayloadToDocumentFeedback = adaptToDocumentFeedbackPayload(
        'ATTACH',
        payload.documentId,
        payload.labelExternalId,
        payload.reporterInfo
      );

      const feedbackIds = await getFeedbackIdOnCreation([
        adaptPayloadToDocumentFeedback,
      ]);

      return applyDocumentFeedback(type, feedbackIds);
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
