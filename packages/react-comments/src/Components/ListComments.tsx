import React from 'react';
import { Comment, Conversation } from '@cognite/cogs.js';
import { getAuthHeaders, useAuthContext } from '@cognite/react-container';

import {
  useFetchComments,
  useCommentCreateMutate,
  useCommentDeleteMutate,
  FetchCommentProps,
} from '../queries';

export type ListCommentsProps = FetchCommentProps;

export const ListComments: React.FC<FetchCommentProps> = ({
  serviceUrl,
  scope,
  target,
}) => {
  const [message, setMessage] = React.useState('');
  const headers = getAuthHeaders({ useIdToken: true });
  const { authState } = useAuthContext();
  const fullServiceUrl = `${serviceUrl}/${authState?.project}`;
  const { mutate } = useCommentCreateMutate({
    target,
    scope: scope ? scope[0] : undefined, // always assume first scope is 'home' app (for legacy)
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
    scope,
    serviceUrl: fullServiceUrl,
  });

  const handleCreateMessage = (comment: string) => {
    mutate(comment);
    setMessage('');
  };
  const handleRemoveComment = (id: string) => {
    deleteComment(id);
  };

  const isLoading = !authState?.id || !headers;

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
      user={authState?.id || ''}
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
