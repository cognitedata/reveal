import React from 'react';
import type { CommentTarget } from '@cognite/comment-service-types';
import { Comment, Conversation } from '@cognite/cogs.js';
import { getAuthHeaders } from '@cognite/react-container';

import {
  useFetchComments,
  useCommentCreateMutate,
  useCommentDeleteMutate,
} from '../queries';

export interface ListCommentsProps {
  project: string;
  serviceUrl: string;
  target: CommentTarget;
  userId: string;
}
export const ListComments: React.FC<ListCommentsProps> = ({
  project,
  serviceUrl,
  target,
  userId,
}) => {
  const [message, setMessage] = React.useState('');
  const headers = getAuthHeaders({ useIdToken: true });
  const fullServiceUrl = `${serviceUrl}/${project}`;
  const { mutate } = useCommentCreateMutate({
    target,
    serviceUrl: fullServiceUrl,
    headers,
  });
  const { mutate: deleteComment } = useCommentDeleteMutate({
    headers,
    serviceUrl: fullServiceUrl,
    target,
  });

  const { data: comments, isError } = useFetchComments({
    target,
    serviceUrl: fullServiceUrl,
  });

  const handleCreateMessage = (comment: string) => {
    mutate(comment);
    setMessage('');
  };
  const handleRemoveComment = (id: string) => {
    deleteComment(id);
  };

  const isLoading = !userId || !headers;

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (isError) {
    return <div>Error loading comments.</div>;
  }

  // console.log('Comment info:', { userId, comments });

  return (
    <Conversation
      reverseOrder
      conversation={comments || []}
      user={userId}
      onRemoveComment={handleRemoveComment}
      input={
        <Comment
          message={message}
          setMessage={setMessage}
          avatar={userId}
          onPostMessage={handleCreateMessage}
        />
      }
    />
  );
};
