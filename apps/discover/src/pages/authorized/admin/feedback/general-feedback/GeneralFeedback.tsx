import React from 'react';

import { SetCommentTarget } from '@cognite/react-comments';

import GeneralFeedbackTable from './GeneralFeedbackTable';

export const GeneralFeedback: React.FC<{
  setCommentTarget: SetCommentTarget;
}> = ({ setCommentTarget }) => {
  return <GeneralFeedbackTable setCommentTarget={setCommentTarget} />;
};

export default GeneralFeedback;
