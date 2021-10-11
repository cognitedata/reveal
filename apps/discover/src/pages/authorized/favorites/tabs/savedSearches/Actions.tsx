import React from 'react';
import { Row } from 'react-table';

import styled from 'styled-components/macro';

import { CommentButton, ShareButton, DeleteButton } from 'components/buttons';
import { SavedSearchItem } from 'modules/api/savedSearches/types';
import { FlexRow, sizes } from 'styles/layout';

export const ActionPadding = styled(FlexRow)`
  margin-right: ${sizes.small};
`;
export const Actions: React.FC<{
  row: Row<SavedSearchItem>;
  handleShare?: (original: SavedSearchItem) => void;
  handleDelete: (original: SavedSearchItem) => void;
  handleComment: (original: SavedSearchItem) => void;
}> = ({ row, handleShare, handleDelete, handleComment }) => (
  <ActionPadding>
    <CommentButton onClick={() => handleComment(row.original)} />
    {handleShare && (
      <ShareButton
        onClick={() => handleShare(row.original)}
        data-testid="saved-search-action-share"
        aria-label="Share saved search"
      />
    )}
    <DeleteButton
      onClick={() => handleDelete(row.original)}
      data-testid="saved-search-action-delete"
      aria-label="Delete saved search"
    />
  </ActionPadding>
);
