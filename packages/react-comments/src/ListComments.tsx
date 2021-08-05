import React from 'react';
import { Comment } from '@cognite/comment-service-types';

interface Props {
  comments: Comment[];
}
export const ListComments: React.FC<Props> = ({ comments }) => {
  // eslint-disable-next-line no-console
  console.log('comments', comments);
  return <div>Coming soon...</div>;
};
