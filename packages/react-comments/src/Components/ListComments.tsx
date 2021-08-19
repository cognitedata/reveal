import React from 'react';
import type { CommentTarget } from '@cognite/comment-service-types';
import { Comment, Conversation, Loader } from '@cognite/cogs.js';
import { useAuthContext, getAuthHeaders } from '@cognite/react-container';

import { useFetchComments, useCreateComment } from '../hooks';

interface ListCommentsProps {
  target: CommentTarget;
  serviceUrl: string;
}
export const ListComments: React.FC<ListCommentsProps> = ({
  target,
  serviceUrl,
}) => {
  const { authState } = useAuthContext();
  const headers = getAuthHeaders({ useIdToken: true });

  const { comments } = useFetchComments({ target, serviceUrl });
  const [message, setMessage] = React.useState('');

  const handleCreateMessage = (comment: string) => {
    useCreateComment({
      target,
      comment,
      serviceUrl,
      project: authState?.project || '',
      headers,
    });
    setMessage('');
  };
  const handleRemoveComment = (content: string) => {
    // eslint-disable-next-line no-console
    console.log('HandleRemoveComment not ready yet:', content);
  };

  const isReady = authState && headers;

  if (!isReady) {
    return <Loader />;
  }

  return (
    <Conversation
      reverseOrder
      conversation={comments}
      user={authState?.email || ''}
      onRemoveComment={handleRemoveComment}
      input={
        <Comment
          message={message}
          setMessage={setMessage}
          avatar={authState?.email}
          onPostMessage={handleCreateMessage}
        />
      }
    />
  );
};
