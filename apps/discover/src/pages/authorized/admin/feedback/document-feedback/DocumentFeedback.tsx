import React from 'react';

import { useFeedbackGetAllQuery } from 'services/feedback/useFeedbackQuery';

import { ObjectFeedbackResponse } from '@cognite/discover-api-types';
import { SetCommentTarget, CommentTarget } from '@cognite/react-comments';

import EmptyState from 'components/EmptyState';

import { DocumentFeedbackTable } from './DocumentFeedbackTable';

const DocumentFeedback: React.FC<{
  setCommentTarget: SetCommentTarget;
  commentTarget?: CommentTarget;
}> = ({ setCommentTarget, commentTarget }) => {
  const { isLoading, data } =
    useFeedbackGetAllQuery<ObjectFeedbackResponse[]>('object');

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
