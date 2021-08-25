import React from 'react';
import type { CommentTarget } from '@cognite/comment-service-types';
import { Comment, Conversation, Loader } from '@cognite/cogs.js';
import { useAuthContext, getAuthHeaders } from '@cognite/react-container';

import { useFetchComments, useCommentCreateMutate } from '../queries';

interface ListCommentsProps {
  target: CommentTarget;
  serviceUrl: string;
}
export const ListComments: React.FC<ListCommentsProps> = ({
  target,
  serviceUrl,
}) => {
  const { authState } = useAuthContext();
  const [message, setMessage] = React.useState('');
  const headers = getAuthHeaders({ useIdToken: true });
  const fullServiceUrl = `${serviceUrl}/${authState?.project}`;
  const { mutate } = useCommentCreateMutate({
    target,
    serviceUrl: fullServiceUrl,
    headers,
  });

  const { data: comments, isError } = useFetchComments({
    target,
    serviceUrl: fullServiceUrl,
  });

  const handleCreateMessage = (comment: string) => {
    mutate(comment);
    setMessage('');
  };
  const handleRemoveComment = (content: string) => {
    // eslint-disable-next-line no-console
    console.log('HandleRemoveComment not ready yet:', content);
  };

  const isLoading = !authState || !headers;

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <div>Error loading comments.</div>;
  }

  return (
    <Conversation
      reverseOrder
      conversation={comments || []}
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
