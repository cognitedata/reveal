import React, {
  useCallback,
  useState,
  useEffect,
  useRef,
  useMemo,
} from 'react';
import { useSearchParams } from 'react-router-dom';

import styled from 'styled-components';

import moment from 'moment';
import { v4 as uuid } from 'uuid';

import {
  Avatar,
  Body,
  Button,
  Divider,
  Flex,
  Icon,
  Textarea,
  Overline,
  Title,
  Tooltip,
  Chip,
  Input,
} from '@cognite/cogs.js';

import { useCommentDeleteMutation } from '../../hooks/use-mutation/useCommentDeleteMutation';
import { useCommentSaveMutation } from '../../hooks/use-mutation/useCommentSaveMutation';
import { useGetCommentByIdQuery } from '../../hooks/use-query/useGetCommentByIdQuery';
import {
  useUserProfile,
  UserProfile,
} from '../../hooks/use-query/useUserProfile';
import { useUsers } from '../../hooks/use-query/useUsers';
import { Comment, CommentAnnotation } from '../../types';
// match alphanumeric and "." and break on spaces since an "@" character
const UserTagRegex = /(@\w+(?:\.\w+)+)+(?!\w)/g;

// match an @ with no text after it closest to the end of the text.
const ReplaceUserRegex = /@(?!\w)( |$)/;

export const CommentTooltipCore: React.FC<{
  comment: Comment;
  users: UserProfile[];
  userIdentifier: string;
  onCreate: (
    comment: Omit<Comment, 'createdTime' | 'lastUpdatedTime' | 'subComments'>
  ) => void;
  onDelete: (comment: Comment) => void;
}> = ({ comment, onCreate, userIdentifier, onDelete, users }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [userSearch, setUserSearch] = useState('');
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  const commentFieldRef = useRef<HTMLTextAreaElement>(null);

  const setOpen = useCallback(
    (state: boolean) => {
      setSearchParams((currentParams) => {
        currentParams.set('openedComment', state ? comment.externalId : '');
        return currentParams;
      });
    },
    [setSearchParams, comment]
  );

  const getAuthorById = useCallback(
    (userId: string) => {
      return (
        users?.find((el) => el.userIdentifier === userId) || {
          displayName: 'Unknown user',
        }
      );
    },
    [users]
  );

  const threadAuthors = useMemo(
    () => [
      ...new Set(
        (comment.subComments || []).map((el) => getAuthorById(el.author))
      ),
    ],
    [comment, getAuthorById]
  );

  const currentUser = useMemo(
    () => getAuthorById(userIdentifier),
    [getAuthorById, userIdentifier]
  );

  const visibleUsers = useMemo(() => {
    return userSearch.trim().length > 0
      ? users.filter((el) =>
          (el.displayName || '')
            .toLowerCase()
            .includes(userSearch.toLowerCase())
        )
      : users;
  }, [users, userSearch]);

  const open =
    searchParams.get('openedComment') === comment.externalId ||
    (comment.subComments || []).length === 0;

  const [isUsersTooltipOpen, setIsUsersTooltipOpen] = useState(false);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (open && commentsContainerRef.current) {
      commentsContainerRef.current.scrollTop =
        commentsContainerRef.current.scrollHeight;
    }
  }, [open, newComment]);

  const createNewComment = () => {
    setOpen(true);
    onCreate({
      text: newComment,
      author: userIdentifier,
      externalId: uuid(),
      thread: comment ? { externalId: comment.externalId } : undefined,
      canvas: comment.canvas
        ? { externalId: comment.canvas.externalId }
        : undefined,
      x: comment.x,
      y: comment.y,
    });

    setNewComment('');
    commentFieldRef.current?.focus();
  };

  if (open) {
    return (
      <CommentWrapper>
        <div className="indicator" onClick={() => setOpen(false)} />
        <div className="line" />
        <Flex className="comment" direction="column">
          <Flex gap={16} alignItems="center" className="comment-header">
            <Icon type="Comment" />
            <Title level={4} style={{ flex: 1 }}>
              Comments
            </Title>
            <Button
              onClick={() => {
                setOpen(false);
                if (!comment.subComments || comment.subComments.length === 0) {
                  onDelete(comment);
                }
              }}
              icon="CloseLarge"
              type="ghost"
              aria-label="close"
            />
          </Flex>
          <Divider />
          <CommentsContainer ref={commentsContainerRef}>
            {comment &&
              (comment?.subComments || []).map((el) => (
                <>
                  <Flex className="comment-item" key={el.externalId} gap={16}>
                    <Avatar text={getAuthorById(el.author).displayName} />
                    <Flex direction="column" style={{ flex: 1 }} gap={8}>
                      <Flex gap={8}>
                        <Overline level={3} style={{ flex: 1 }}>
                          {getAuthorById(el.author).displayName}
                        </Overline>
                        <Overline level={3} muted>
                          {moment(el.createdTime).fromNow()}
                        </Overline>
                      </Flex>
                      {renderCommentText(el.text, users)}
                    </Flex>
                  </Flex>
                  <Divider key={`${el.externalId}-divider`} />
                </>
              ))}
          </CommentsContainer>
          <Flex className="comment-input" gap={16}>
            <Avatar text={currentUser?.displayName} />
            <Flex style={{ flex: 1 }} gap={8} direction="column">
              <Tooltip
                inverted
                interactive
                elevated
                disabled={!users || users.length === 0}
                visible={isUsersTooltipOpen}
                content={
                  <Flex direction="column" gap={8}>
                    <Input
                      onChange={(ev) => setUserSearch(ev.target.value)}
                      value={userSearch}
                      placeholder="Search for user..."
                    />
                    <UsersTooltip direction="column" gap={4}>
                      {(visibleUsers || [])
                        .filter((el) => el.displayName)
                        .map((el) => (
                          <Flex
                            style={{ width: '100%', cursor: 'pointer' }}
                            gap={4}
                            alignItems="center"
                            onClick={() => {
                              // replace @ with correct username
                              setNewComment((currComment) =>
                                currComment.replace(
                                  ReplaceUserRegex,
                                  `@${convertDisplayNameToTaggableName(
                                    el.displayName!
                                  )} `
                                )
                              );
                              setIsUsersTooltipOpen(false);
                            }}
                          >
                            <Avatar text={el.displayName} />
                            <Body level={2}>
                              {convertDisplayNameToTaggableName(
                                el.displayName!
                              )}
                            </Body>
                          </Flex>
                        ))}
                    </UsersTooltip>
                  </Flex>
                }
              >
                <Textarea
                  placeholder="Write a comment..."
                  ref={commentFieldRef}
                  fullWidth
                  value={newComment}
                  onKeyDown={(ev) => {
                    // TODO this is all a hack!
                    if (ev.key === '@') {
                      setIsUsersTooltipOpen(true);
                      return;
                    }

                    if (
                      ev.key === 'Enter' &&
                      !ev.shiftKey &&
                      newComment.trim().length > 0
                    ) {
                      createNewComment();
                      return;
                    }
                    setIsUsersTooltipOpen(false);
                  }}
                  onChange={(ev) => setNewComment(ev.target.value)}
                />
              </Tooltip>
              <Flex gap={8} direction="row-reverse">
                <Button
                  type="primary"
                  disabled={newComment.trim().length === 0}
                  onClick={() => createNewComment()}
                >
                  Send
                </Button>
                <Button onClick={() => setNewComment('')}>Cancel</Button>
                <div style={{ flex: 1 }} />
                {comment.author === userIdentifier && (
                  <Button
                    type="ghost-destructive"
                    onClick={() => onDelete(comment)}
                  >
                    Delete
                  </Button>
                )}
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
      onClick={() => setOpen(true)}
      justifyContent="center"
    >
      <Body strong level={3} style={{ color: 'white', textAlign: 'center' }}>
        {threadAuthors.length === 1
          ? getInitials(threadAuthors[0].displayName || '')
          : threadAuthors.length || ''}
      </Body>
    </CommentMarker>
  );
};
export const CommentTooltip: React.FC<{ comment: CommentAnnotation }> = ({
  comment: { id: commentExternalId },
}) => {
  const { data: profile = { userIdentifier: undefined } } = useUserProfile();

  const { userIdentifier } = profile;

  const { data: comment } = useGetCommentByIdQuery(commentExternalId);

  const { mutate: saveComment } = useCommentSaveMutation();
  const { mutate: deleteComment } = useCommentDeleteMutation();

  const { data: users = [] } = useUsers();

  // if someone else's draft ignore!

  console.log(comment);
  if (
    comment === undefined ||
    (comment.subComments.length === 0 && comment.author !== userIdentifier)
  ) {
    return <></>;
  }

  return (
    <CommentTooltipCore
      comment={comment}
      users={users || []}
      userIdentifier={userIdentifier || ''}
      onCreate={(newComment) => saveComment(newComment)}
      onDelete={(toDeleteComment) => deleteComment(toDeleteComment)}
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

const CommentsContainer = styled.div`
  max-height: 350px;
  overflow-x: scroll;
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

const UsersTooltip = styled(Flex)`
  overflow: auto;
  max-height: 200px;
  flex: 1;

  && > div {
    transition: all 0.2s;
    padding: 6px;
    border-radius: 4px;
    width: 100%;
    flex: 1;
  }
  && > div:hover {
    background: rgba(83, 88, 127, 0.12);
  }
`;
const NameTag = styled(Chip)`
  margin-top: -2px;
`;

const getInitials = (name: string) =>
  name
    .split(/[ .]/)
    .slice(0, 2)
    .map((el) => el.charAt(0))
    .join('')
    .toUpperCase();

const wrapRegexTextWithComponent = (
  text: string,
  regex: RegExp,
  renderer: (text: string) => React.ReactNode
) => {
  const textArray = text.split(regex);
  return textArray.map((str) => {
    if (regex.test(str)) {
      return renderer(str);
    }
    return str;
  });
};

const convertDisplayNameToTaggableName = (text: string) => {
  return text?.replaceAll(' ', '.');
};

const renderCommentText = (text: string, users: UserProfile[]) => (
  <Body style={{ lineHeight: 1.6 }} level={2}>
    {/** Convert parts of the text into a <Chip> for tagged users */}
    {wrapRegexTextWithComponent(text, UserTagRegex, (match) => {
      if (
        users?.some(
          (user) =>
            convertDisplayNameToTaggableName(user.displayName || '') ===
            match.substring(1)
        )
      ) {
        return (
          <NameTag label={match} hideTooltip size="small" type="neutral" />
        );
      }
      return match;
    })}
  </Body>
);
