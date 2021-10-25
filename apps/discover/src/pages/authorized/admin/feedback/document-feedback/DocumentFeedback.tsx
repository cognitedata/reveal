import React from 'react';

import { SetCommentTarget, CommentTarget } from '@cognite/react-comments';

import EmptyState from 'components/emptyState';
import { useFeedbackGetAllQuery } from 'modules/api/feedback/useFeedbackQuery';
import { DocumentFeedbackItem } from 'modules/feedback/types';

import { DocumentFeedbackTable } from './DocumentFeedbackTable';

const DocumentFeedback: React.FC<{
  setCommentTarget: SetCommentTarget;
  commentTarget?: CommentTarget;
}> = ({ setCommentTarget, commentTarget }) => {
  const {
    isLoading,
    data,
  }: {
    isLoading: boolean;
    data?: DocumentFeedbackItem[];
  } = useFeedbackGetAllQuery('object');

  if (isLoading || !data?.length) {
    return (
      <EmptyState
        isLoading={isLoading}
        img="Recent"
        emptyTitle="No feedback has been submitted"
      />
    );
  }

  return (
    <DocumentFeedbackTable
      documentFeedbackItems={data}
      setCommentTarget={setCommentTarget}
      commentTarget={commentTarget}
    />
  );
};

export default DocumentFeedback;
