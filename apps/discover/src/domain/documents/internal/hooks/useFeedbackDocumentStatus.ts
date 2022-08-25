import { OTHER_DOCUMENT_TYPE } from 'domain/documents/constants';

import { toISOStringDate } from 'utils/date';
import { sortByDate } from 'utils/sort';

import { useDocumentFeedbackListQuery } from '../../service/queries/userDocumentFeedbackListQuery';

/**
 * Checks feedback status of document with respective label suggestion.
 */
export const useFeedbackDocumentStatus = (
  documentId: number,
  label: string,
  feedbackCreatedTime: string
) => {
  const { data, isLoading } = useDocumentFeedbackListQuery();

  /**
   * Check if there are any feedback that is submitted with
   * specific document id and label, and that its feedback submission
   * date comes after the list of registered document feedbacks.
   *
   * (NB: latter is done because it might be cases where same document
   * and same label has been assessed before, and thus, we need to
   * validate whether the feedback creation time comes after the new
   * submission or not)
   *
   * FYI: That NB could have been avoided if we proceeded to create the
   * document feedback upon feedback creation and then stored the generated
   * feedback id in the database...
   */
  const documentAssessments = (data?.items || [])
    .sort((a, b) => {
      return sortByDate(new Date(a.createdAt), new Date(b.createdAt));
    })
    .find((item) => {
      const feedbackCreatedTimeDate = toISOStringDate(item.createdAt);
      const documentFeedbackAssessedTimeDate =
        toISOStringDate(feedbackCreatedTime);

      return (
        item.documentId === documentId &&
        (item.label.externalId === label || label === OTHER_DOCUMENT_TYPE.id) &&
        feedbackCreatedTimeDate >= documentFeedbackAssessedTimeDate
      );
    });

  return {
    loading: isLoading,
    status: documentAssessments?.status,
    assessed: !!documentAssessments,
  };
};
