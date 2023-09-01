import { Fragment } from 'react';

import styled from 'styled-components';

import formatDistanceToNow from 'date-fns/formatDistanceToNow';

import { Body, Chip, Flex, Overline, Avatar, Divider } from '@cognite/cogs.js';

import { USER_IDENTIFIER_REGEXP } from '../../constants';
import { Comment } from '../../services/comments/types';
import { isNonEmptyString } from '../../services/comments/utils';
import { UserProfile } from '../../UserProfileProvider';

const findUserByUserId = (users: UserProfile[], userId: string) =>
  users.find((user) => user.userIdentifier === userId);

const wrapRegexTextWithComponent = (
  text: string,
  regex: RegExp,
  renderer: (text: string) => React.ReactNode
) => {
  const textArray = text.split(regex);
  return textArray.map((str) => {
    return renderer(str);
  });
};
const renderCommentText = (text: string, users: UserProfile[]) => (
  <Body style={{ lineHeight: 1.6 }} level={2}>
    {/** Convert parts of the text into a <Chip> for tagged users */}
    {wrapRegexTextWithComponent(
      text,
      USER_IDENTIFIER_REGEXP,
      (matchedUserIdentifier) => {
        const foundUser = findUserByUserId(users, matchedUserIdentifier);
        if (foundUser !== undefined) {
          return (
            <NameTag
              key={`name-tag-${foundUser.userIdentifier}`}
              label={'@' + foundUser.displayName}
              hideTooltip
              size="small"
              type="neutral"
            />
          );
        }
        return matchedUserIdentifier;
      }
    )}
  </Body>
);

type CommentDisplayProps = {
  commentList: Comment[];
  users: UserProfile[];
  sortOrder: 'ASC' | 'DSC';
};

export const CommentDisplay = ({
  commentList,
  users,
  sortOrder = 'ASC',
}: CommentDisplayProps) => {
  const sortedList = commentList
    .filter((comment) => isNonEmptyString(comment.text))
    .sort((a, b) =>
      sortOrder === 'DSC'
        ? new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
        : new Date(a.createdTime).getTime() - new Date(b.createdTime).getTime()
    );
  return (
    <>
      {sortedList.map((el) => {
        const foundUser = findUserByUserId(
          users,
          el.createdBy?.userIdentifier || ''
        );

        return (
          <Fragment key={`comment-display-${el.externalId}-${el.createdTime}`}>
            <Flex className="comment-item" alignItems="center" gap={16}>
              <Avatar text={foundUser?.displayName} />
              <Flex direction="column" style={{ flex: 1 }} gap={8}>
                <Flex gap={8}>
                  <StyledOverline level={3} style={{ flex: 1 }}>
                    {foundUser?.displayName}
                  </StyledOverline>
                  <Overline level={3} muted>
                    {formatDistanceToNow(el.createdTime, { addSuffix: true })}
                  </Overline>
                </Flex>
                {renderCommentText(el.text, users)}
              </Flex>
            </Flex>
            <Divider />
          </Fragment>
        );
      })}
    </>
  );
};

const NameTag = styled(Chip)`
  margin-right: 2px;
  margin-left: 2px;
`;

const StyledOverline = styled(Overline)`
  color: var(--cogs-text-icon--medium);
`;
