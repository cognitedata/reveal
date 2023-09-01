import React, { useState } from 'react';

import styled from 'styled-components';

import { useDebounce } from 'use-debounce';

import { Button, Icon, Input, Heading } from '@cognite/cogs.js';

import { useCommentsPaneSearch } from '../../../lib/hooks/useCommentsPaneSearch';
import { UserProfile } from '../../../lib/UserProfileProvider';
import { translationKeys } from '../../common';
import { CommentDisplay } from '../../components/comment/CommentDisplay';
import { useTranslation } from '../../hooks/useTranslation';
import { Comment } from '../../services/comments/types';

const SEARCH_DEBOUNCE_MS = 200;

type Props = {
  comments: Comment[];
  isLoading: boolean;
  onCloseCommentsPane: () => void;
  users: UserProfile[];
};

export const CommentsPane: React.FC<Props> = ({
  comments,
  isLoading,
  onCloseCommentsPane,
  users,
}) => {
  const { t } = useTranslation();
  const textIsNotEmpty = (comment: Comment) => comment.text !== '';

  const commentCount = comments.filter(textIsNotEmpty).length;
  const [searchString, setSearchString] = useState<string>('');

  const [debouncedSearchString] = useDebounce(searchString, SEARCH_DEBOUNCE_MS);
  const { filteredComments } = useCommentsPaneSearch({
    comments,
    searchString: debouncedSearchString,
    users,
  });
  const filteredCommentCount = filteredComments.filter(textIsNotEmpty).length;

  const getCommentCountText = () => {
    if (isLoading) {
      return (
        <span>
          <Icon type="Loader" />
        </span>
      );
    }

    if (Boolean(searchString) && commentCount > 0) {
      return `(${filteredCommentCount} out of ${commentCount})`;
    }

    if (commentCount > 0) {
      return `(${commentCount})`;
    }

    return null;
  };

  return (
    <StyledCommentsPane>
      <HeaderWrapper>
        <TitleWrapper>
          <Heading level={4} style={{ flex: 1 }}>
            Comments {getCommentCountText()}
          </Heading>
          <Button
            onClick={onCloseCommentsPane}
            icon="CloseLarge"
            type="ghost"
            aria-label="close"
          />
        </TitleWrapper>

        <InputWrapper>
          <StyledInput
            onChange={(ev) => setSearchString(ev.target.value)}
            value={searchString}
            placeholder={t(
              translationKeys.SEARCH_INPUT_PLACEHOLDER,
              'Search...'
            )}
          />
        </InputWrapper>
      </HeaderWrapper>

      {isLoading ? (
        <LoaderWrapper>
          <Icon type="Loader" />
        </LoaderWrapper>
      ) : (
        <ConversationWrapper>
          <CommentDisplay
            commentList={filteredComments}
            users={users}
            sortOrder="DSC"
          />
        </ConversationWrapper>
      )}
    </StyledCommentsPane>
  );
};

const StyledCommentsPane = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const HeaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
`;

const TitleWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const InputWrapper = styled.div`
  display: flex;
  width: 100%;
  margin: 6px 0;
`;

const StyledInput = styled(Input)`
  width: 100%;
  border: none;
  background: var(--cogs-surface--action--muted--default);
  color: var(--cogs-text-icon--medium);

  ::placeholder {
    color: var(--cogs-text-icon--medium);
  }
`;

const ConversationWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 16px 16px 16px;
  overflow: auto;
  gap: 16px;
`;

const LoaderWrapper = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;
