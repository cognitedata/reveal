import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import styled from 'styled-components';

import { LexicalEditor, $getRoot } from 'lexical';
import { v4 as uuid } from 'uuid';

import {
  Avatar,
  Body,
  Button,
  Divider,
  Flex,
  Icon,
  Title,
} from '@cognite/cogs.js';

import { useUsers } from '../../hooks/use-query/useUsers';
import {
  useCommentsDeleteMutation,
  useCommentsUpsertMutation,
  useListCommentsQuery,
} from '../../services/comments/hooks';
import {
  Comment,
  CommentTargetType,
  SerializedComment,
} from '../../services/comments/types';
import { getTextContentFromEditorState } from '../../services/comments/utils';
import { CommentAnnotation } from '../../types';
import { UserProfile, useUserProfile } from '../../UserProfileProvider';
import { CommentDisplay } from '../comment/CommentDisplay';
import { CommentEditor } from '../comment/CommentEditor';

type CommentTooltipCoreProps = {
  comments: Comment[];
  commentExternalId: string;
  users: UserProfile[];
  userIdentifier: string;
  onCreate: (
    comment: Omit<SerializedComment, 'lastUpdatedTime' | 'createdTime'>[]
  ) => void;
  onDelete: (commentId: string) => void;
};
export const CommentTooltipCore = ({
  comments,
  onCreate,
  userIdentifier,
  commentExternalId,
  // onDelete,
  users,
}: CommentTooltipCoreProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { userProfile } = useUserProfile();
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  const canvasId = searchParams.get('canvasId');
  const commentTooltipId = searchParams.get('commentTooltipId');
  const setOpen = (id: string | null) =>
    setSearchParams((currentParams) => {
      if (id !== null) {
        currentParams.set('commentTooltipId', id);
      } else {
        currentParams.delete('commentTooltipId');
      }
      return currentParams;
    });

  const isTooltipOpen =
    searchParams.get('commentTooltipId') === commentExternalId;
  const editorRef = useRef<LexicalEditor>(null);
  useEffect(() => {
    if (isTooltipOpen && commentsContainerRef.current) {
      commentsContainerRef.current.scrollTop =
        commentsContainerRef.current.scrollHeight;
    }
  }, [isTooltipOpen]);

  const createNewComment = () => {
    if (editorRef.current !== null) {
      const editorState = editorRef.current?.getEditorState();

      onCreate([
        {
          text: getTextContentFromEditorState(editorState),
          createdById: userIdentifier,
          externalId: uuid(),
          targetType: CommentTargetType.CANVAS,
          targetId: canvasId ?? undefined,
          parentComment: { externalId: commentTooltipId ?? '' },
        },
      ]);

      editorRef.current?.update(() => {
        $getRoot().clear();
      });
    }
  };

  if (isTooltipOpen) {
    return (
      <CommentWrapper>
        <div className="indicator" onClick={() => setOpen(null)} />
        <div className="line" />
        <Flex className="comment" direction="column">
          <Flex gap={16} alignItems="center" className="comment-header">
            <Icon type="Comment" />
            <Title level={4} style={{ flex: 1 }}>
              Comments
            </Title>
            <Button
              onClick={() => {
                setOpen(null);
              }}
              icon="CloseLarge"
              type="ghost"
              aria-label="close"
            />
          </Flex>
          <Divider />
          <CommentsContainer>
            <CommentDisplay
              commentList={comments}
              users={users}
              sortOrder="ASC"
            />
          </CommentsContainer>
          <Flex className="comment-input" gap={16}>
            <Avatar text={userProfile.displayName} />
            <Flex style={{ flex: 1 }} gap={8} direction="column">
              <CommentEditor users={users} ref={editorRef} />
              <Flex gap={8} direction="row-reverse">
                <Button type="primary" onClick={() => createNewComment()}>
                  Send
                </Button>
                <Button onClick={() => setOpen(null)}>Cancel</Button>
                <div style={{ flex: 1 }} />
                {/* {comment.createdBy?.userIdentifier === userIdentifier && (
                  <Button
                    type="ghost-destructive"
                    onClick={() => onDelete(comment.externalId)}
                  >
                    Delete
                  </Button>
                )} */}
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </CommentWrapper>
    );
  }
  return (
    <CommentMarker
      alignItems="center"
      onClick={() => setOpen(commentExternalId)}
      justifyContent="center"
    >
      <Body strong level={3} style={{ color: 'white', textAlign: 'center' }}>
        {comments.length &&
          getInitials(comments[0].createdBy?.displayName || '')}
      </Body>
    </CommentMarker>
  );
};
export const CommentTooltip = ({
  comment: { id: commentExternalId },
}: {
  comment: CommentAnnotation;
}) => {
  const {
    userProfile: { userIdentifier },
  } = useUserProfile();
  const [searchParams] = useSearchParams();
  const canvasId = searchParams.get('canvasId');

  const { comments } = useListCommentsQuery({
    targetType: CommentTargetType.CANVAS,
    targetId: canvasId ?? undefined,
    parentComment: { externalId: commentExternalId },
  });

  const { mutate: upsertComment } = useCommentsUpsertMutation();
  const { mutate: deleteComment } = useCommentsDeleteMutation();

  const { data: users = [] } = useUsers();

  // if someone else's draft ignore!
  if (commentExternalId === undefined) {
    return <></>;
  }

  return (
    <CommentTooltipCore
      comments={comments}
      commentExternalId={commentExternalId}
      users={users}
      userIdentifier={userIdentifier}
      onCreate={(newComment) => upsertComment(newComment)}
      onDelete={(toDeleteComment) => deleteComment([toDeleteComment])}
    />
  );
};

const CommentMarker = styled(Flex)`
  position: absolute;
  top: -25px;
  left: -15px;
  background: #4a67fb;
  box-shadow: 0px 0px 0px 4px rgba(110, 133, 252, 0.5);
  border-radius: 100px 100px 100px 0px;
  width: 31px;
  height: 30px;
  color: white;
  padding: 5px 6px;
`;

const CommentWrapper = styled(Flex)`
  position: absolute;
  top: -15px;
  left: -15px;
  pointer-events: none;
  .indicator {
    width: 18px;
    height: 18px;
    background: #4a67fb;
    border-radius: 50%;
  }
  .line {
    width: 40px;
    height: 0px;
    margin-top: 8px;
    border: 1.5px solid #4a67fb;
  }
  .comment {
    pointer-events: auto;
    margin-top: -24px;
    background: #fff;
    width: 400px;
    box-shadow: 0px 1px 16px 4px rgba(79, 82, 104, 0.1),
      0px 1px 8px rgba(79, 82, 104, 0.08), 0px 1px 2px rgba(79, 82, 104, 0.24);
    border-radius: 12px;

    .comment-header {
      padding: 16px 24px;
    }

    .comment-item {
      padding: 16px;
    }
    .comment-input {
      padding: 16px;
    }
  }
`;

const CommentsContainer = styled.div`
  max-height: 350px;
  overflow-x: scroll;
`;

const getInitials = (name: string) =>
  name
    .split(/[ .]/)
    .slice(0, 2)
    .map((el) => el.charAt(0))
    .join('')
    .toUpperCase();
