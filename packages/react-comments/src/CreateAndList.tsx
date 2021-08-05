import React from 'react';
import { Comment, CommentTarget } from '@cognite/comment-service-types';

interface Props {
  target: CommentTarget;
  comments: Comment;
}
export const CreateAndList: React.FC<Props> = ({ target, comments }) => {
  // eslint-disable-next-line no-console
  console.log('target, comments', target, comments);
  return <div>Coming soon...</div>;
};
