import React from 'react';
import { CommentTarget } from '@cognite/comment-service-types';

interface Props {
  target: CommentTarget;
  visible: boolean;
  handleOpen: () => void;
  handleClose: () => void;
}
export const Drawer: React.FC<Props> = ({ target }) => {
  // eslint-disable-next-line no-console
  console.log('target', target);
  return <div>Coming soon...</div>;
};
