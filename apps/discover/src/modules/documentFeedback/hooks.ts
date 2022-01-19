import head from 'lodash/head';

import { useDocumentFeedbackListQuery } from './query';

/**
 * Checks feedback status of document with respective label suggestion.
 */
export const useFeedbackDocumentStatus = (
  documentId: number,
  label: string
) => {
  const { data, isLoading } = useDocumentFeedbackListQuery();

  const documentAssessments = (data?.items || []).filter((item) => {
    return item.documentId === documentId && item.label.externalId === label;
  });

  const hasDocumentBeenAssessed =
    documentAssessments.length > 0 &&
    documentAssessments?.every((item) => {
      return ['ACCEPTED', 'REJECTED', 'STALE'].includes(item.status);
    });

  return {
    loading: isLoading,
    status: head(documentAssessments)?.status,
    assessed: hasDocumentBeenAssessed,
  };
};
