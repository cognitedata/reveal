import React from 'react';
import styled from 'styled-components';
import { ErrorBoundary } from '@cognite/react-errors';
import { Comment, Conversation } from '@cognite/cogs.js';
import { getTenantInfo, useAuthContext } from '@cognite/react-container';
import { CommentResponse } from '@cognite/comment-service-types';

import { convertCommentToRichtextEditable } from '../utils/convertCommentToRichtext';
import {
  useFetchUser,
  useFetchComments,
  useCommentCreateMutate,
  useCommentEditMutate,
  useCommentDeleteMutate,
  FetchCommentProps,
} from '../queries';
import { BaseUrls } from '../types';

import { Richtext, CommentData } from './Richtext';

const ConversationContainer = styled.div`
  text-align: left;

  p {
    margin-block-end: 0em;
  }
`;

export type ListCommentsProps = Pick<FetchCommentProps, 'scope' | 'target'> &
  BaseUrls & { fasAppId?: string; idToken?: string };

export const ListComments: React.FC<ListCommentsProps> = ({
  scope,
  target,
  commentServiceBaseUrl,
  userManagementServiceBaseUrl,
  fasAppId,
  idToken,
}) => {
  const [, projectFromUrl] = getTenantInfo(window.location);

  const { authState } = useAuthContext();
  const [editing, setEditing] = React.useState<
    CommentResponse['id'] | undefined
  >();
  const fullServiceUrl = `${commentServiceBaseUrl}/${
    authState?.project || projectFromUrl
  }`;
  const { mutate: createComment } = useCommentCreateMutate({
    target,
    scope: scope ? scope[0] : undefined, // always assume first scope is 'home' app (for legacy)
    serviceUrl: fullServiceUrl,
    fasAppId,
    idToken,
  });
  const { mutate: deleteComment } = useCommentDeleteMutate({
    serviceUrl: fullServiceUrl,
    target,
    fasAppId,
    idToken,
  });

  const { mutate: editComment } = useCommentEditMutate({
    serviceUrl: fullServiceUrl,
    target,
    fasAppId,
    idToken,
  });

  const { data: richComments, isError } = useFetchComments({
    target,
    scope,
    serviceUrl: fullServiceUrl,
    fasAppId,
    idToken,
  });

  const { data: user } = useFetchUser({
    userManagementServiceBaseUrl,
    fasAppId,
    idToken,
  });

  const handleCreateMessage = (comment: CommentData) => {
    createComment(JSON.stringify(comment));
  };

  const handleEditCommentStart = (id: string) => {
    setEditing(id);
  };

  const handleEditCommentComplete = (comment: CommentData) => {
    editComment({ id: editing, comment: JSON.stringify(comment) });
    setEditing(undefined);
  };

  const handleRemoveComment = (id: string) => {
    deleteComment(id);
  };

  const isLoading = !authState?.id || !target;

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (isError) {
    return <div>Error loading comments.</div>;
  }

  if (!richComments) {
    return null;
  }

  let conversation = richComments;

  if (editing) {
    conversation = richComments.map((comment) => {
      if (comment.id === editing) {
        return convertCommentToRichtextEditable({
          comment,
          handleSaveMessage: handleEditCommentComplete,
          handleCancel: () => setEditing(undefined),
          userManagementServiceBaseUrl,
        });
      }

      return comment;
    });
  }

  // console.log('Comment info:', { authState, conversation });

  const actionButtonsTarget = 'comment-action-buttons';

  return (
    <ConversationContainer>
      <ErrorBoundary instanceId="comment-root">
        <Conversation
          key={`${target.id}+${target.targetType}`}
          reverseOrder
          conversation={conversation}
          userId={authState?.id || ''}
          onRemoveComment={handleRemoveComment}
          onEditComment={handleEditCommentStart}
          input={
            <>
              <Comment
                avatar={user?.displayName}
                Textarea={
                  <Richtext
                    actionTarget={actionButtonsTarget}
                    onPostMessage={handleCreateMessage}
                    userManagementServiceBaseUrl={userManagementServiceBaseUrl}
                    fasAppId={fasAppId}
                  />
                }
              />
              <div id={actionButtonsTarget} />
            </>
          }
        />
      </ErrorBoundary>
    </ConversationContainer>
  );
};
