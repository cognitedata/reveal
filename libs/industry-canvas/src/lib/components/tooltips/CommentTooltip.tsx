import { useEffect, useState, useRef, useCallback } from 'react';
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
  Heading,
  Icon,
  Popconfirm,
} from '@cognite/cogs.js';

import { translationKeys } from '../../common';
import { useUsers } from '../../hooks/use-query/useUsers';
import { useTranslation } from '../../hooks/useTranslation';
import {
  useCommentsDeleteMutation,
  useCommentsUpsertMutation,
} from '../../services/comments/hooks';
import { Comment, CommentTargetType } from '../../services/comments/types';
import {
  getCdfUserFromUserProfile,
  getTextContentFromEditorState,
} from '../../services/comments/utils';
import {
  createPendingComment,
  onDeleteRequest,
} from '../../state/useIndustrialCanvasStore';
import { CommentAnnotation, SerializedCanvasDocument } from '../../types';
import { UserProfile, useUserProfile } from '../../UserProfileProvider';
import zIndex from '../../utils/zIndex';
import { CommentDisplay } from '../comment/CommentDisplay';
import { CommentEditor } from '../comment/CommentEditor';

type CommentTooltipCoreProps = {
  isTooltipOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  comments: Comment[];
  users: UserProfile[];
  onCreate: (content: string) => void;
  onDelete?: () => void;
};
export const CommentTooltipCore = ({
  isTooltipOpen,
  onOpen,
  onClose,
  comments,
  onCreate,
  onDelete,
  users,
}: CommentTooltipCoreProps) => {
  const { t } = useTranslation();
  const { userProfile } = useUserProfile();
  const [rawTextContent, setRawTextContent] = useState<string>('');
  const commentsContainerRef = useRef<HTMLDivElement>(null);

  const editorRef = useRef<LexicalEditor>(null);
  useEffect(() => {
    if (isTooltipOpen && commentsContainerRef.current) {
      commentsContainerRef.current.scrollTop =
        commentsContainerRef.current.scrollHeight;
    }
  }, [comments, isTooltipOpen]);

  const clearEditor = () => {
    editorRef.current?.update(() => {
      $getRoot().clear();
    });
    setRawTextContent('');
  };
  const onCreateWrapper = () => {
    if (editorRef.current === null) {
      return;
    }
    onCreate(getTextContentFromEditorState(editorRef.current.getEditorState()));
    clearEditor();
  };
  const onCloseWrapper = () => {
    onClose();
    clearEditor();
  };

  if (isTooltipOpen) {
    return (
      <CommentWrapper>
        <div className="indicator" onClick={onCloseWrapper} />
        <div className="line" />
        <Flex className="comment" direction="column">
          <Flex gap={16} alignItems="center" className="comment-header">
            <Icon type="Comment" />
            <Heading level={4} style={{ flex: 1 }}>
              {t(translationKeys.COMMENT_TOOLTIP_COMMENTS, 'Comments')}
            </Heading>
            <Button
              onClick={onClose}
              icon="CloseLarge"
              type="ghost"
              aria-label="close"
            />
          </Flex>
          <Divider />
          <CommentsContainer ref={commentsContainerRef}>
            <CommentDisplay
              commentList={comments}
              users={users}
              sortOrder="ASC"
            />
          </CommentsContainer>
          <Flex className="comment-input" gap={16}>
            <Avatar text={userProfile.displayName} />
            <Flex style={{ flex: 1 }} gap={8} direction="column">
              <CommentEditor
                ref={editorRef}
                setEditorTextContent={setRawTextContent}
              />
              <Flex gap={8} direction="row-reverse">
                <Button
                  type="primary"
                  disabled={rawTextContent.length === 0}
                  onClick={onCreateWrapper}
                >
                  {t(translationKeys.COMMENT_TOOLTIP_SEND, 'Send')}
                </Button>
                <Button type="ghost" onClick={onCloseWrapper}>
                  {t(translationKeys.COMMENT_TOOLTIP_CANCEL, 'Cancel')}
                </Button>
                {onDelete !== undefined && (
                  <DeleteButtonContainer>
                    <Popconfirm
                      onConfirm={onDelete}
                      content={t(
                        translationKeys.COMMENT_TOOLTIP_DELETE_POPCONFIRM_CONTENT,
                        'Are you sure you want to permanently delete this comment?'
                      )}
                    >
                      <Button type="ghost-destructive">
                        {t(translationKeys.COMMENT_TOOLTIP_DELETE, 'Delete')}
                      </Button>
                    </Popconfirm>
                  </DeleteButtonContainer>
                )}
                <div style={{ flex: 1 }} />
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </CommentWrapper>
    );
  }
  return (
    <CommentMarker alignItems="center" onClick={onOpen} justifyContent="center">
      <Body strong size="small" style={{ color: 'white', textAlign: 'center' }}>
        {comments.length &&
          getInitials(comments[0].createdBy?.displayName || '')}
      </Body>
    </CommentMarker>
  );
};
export const CommentTooltip = ({
  activeCanvas,
  parentComment,
  comments,
  commentAnnotation,
  isPendingComment,
}: {
  activeCanvas: SerializedCanvasDocument;
  parentComment: Comment | undefined;
  comments: Comment[];
  commentAnnotation: CommentAnnotation;
  isPendingComment: boolean;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { userProfile } = useUserProfile();
  const { data: users = [] } = useUsers();
  const canvasId = searchParams.get('canvasId');
  const commentTooltipId = searchParams.get('commentTooltipId');
  const isTooltipOpen =
    isPendingComment || commentTooltipId === commentAnnotation.id;

  const { mutateAsync: upsertComment } = useCommentsUpsertMutation();
  const { mutate: deleteComments } = useCommentsDeleteMutation();

  const setOpen = useCallback(
    (id: string | null) =>
      setSearchParams((currentParams) => {
        if (id !== null) {
          currentParams.set('commentTooltipId', id);
        } else {
          currentParams.delete('commentTooltipId');
        }
        return currentParams;
      }),
    [setSearchParams]
  );
  const onCreate = useCallback(
    (content: string) => {
      if (canvasId === null) {
        console.warn('targetId was undefined, will not post comment');
        return;
      }
      if (isPendingComment) {
        upsertComment([
          {
            text: '',
            createdBy: getCdfUserFromUserProfile(userProfile),
            targetType: CommentTargetType.CANVAS,
            targetId: canvasId,
            externalId: commentAnnotation.id,
            targetContext: {
              x: commentAnnotation.x,
              y: commentAnnotation.y,
            },
          },
        ]).then(() => {
          setSearchParams((currentParams) => {
            currentParams.set('commentTooltipId', commentAnnotation.id);
            return currentParams;
          });
          createPendingComment(null);
          upsertComment([
            {
              text: content,
              createdBy: getCdfUserFromUserProfile(userProfile),
              externalId: uuid(),
              targetType: CommentTargetType.CANVAS,
              targetId: canvasId,
              parentComment: { externalId: commentAnnotation.id },
            },
          ]);
        });
        return;
      }
      upsertComment([
        {
          text: content,
          createdBy: getCdfUserFromUserProfile(userProfile),
          externalId: uuid(),
          targetType: CommentTargetType.CANVAS,
          targetId: canvasId,
          parentComment: { externalId: commentTooltipId ?? '' },
        },
      ]);
    },
    [
      canvasId,
      commentAnnotation.id,
      commentAnnotation.x,
      commentAnnotation.y,
      commentTooltipId,
      isPendingComment,
      setSearchParams,
      upsertComment,
      userProfile,
    ]
  );

  const onDelete = () => {
    if (!isTooltipOpen || parentComment === undefined) {
      return;
    }
    deleteComments([
      parentComment.externalId,
      ...comments.map(({ externalId }) => externalId),
    ]);
    onDeleteRequest({
      annotationIds: [commentAnnotation.id],
      containerIds: [],
    });
    setOpen(null);
  };

  const onClose = useCallback(() => {
    if (isPendingComment) {
      createPendingComment(null);
      return;
    }
    setOpen(null);
  }, [isPendingComment, setOpen]);
  return (
    <CommentTooltipCore
      isTooltipOpen={isTooltipOpen}
      onOpen={() => setOpen(commentAnnotation.id)}
      onClose={onClose}
      comments={comments}
      users={users}
      onCreate={onCreate}
      onDelete={
        // Either the creator of the canvas or the comment may delete it
        !isPendingComment &&
        (parentComment?.createdBy?.userIdentifier ===
          userProfile.userIdentifier ||
          activeCanvas.createdBy === userProfile.userIdentifier)
          ? onDelete
          : undefined
      }
    />
  );
};

const DeleteButtonContainer = styled.div`
  position: relative;
  right: 45%;
`;

const CommentMarker = styled(Flex)`
  position: absolute;
  z-index: ${zIndex.INDICATOR};
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
  z-index: ${zIndex.MAXIMUM};
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
