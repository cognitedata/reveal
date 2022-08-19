import * as React from 'react';

import { SetCommentTarget, CommentTarget } from '@cognite/react-comments';

import GeneralFeedbackTable from './GeneralFeedbackTable';

export const GeneralFeedback: React.FC<{
  setCommentTarget: SetCommentTarget;
  commentTarget?: CommentTarget;
}> = ({ setCommentTarget, commentTarget }) => {
  return (
    <GeneralFeedbackTable
      setCommentTarget={setCommentTarget}
      commentTarget={commentTarget}
    />
  );
};

export default GeneralFeedback;
