import React from 'react';

import styled from 'styled-components/macro';

import {
  DuplicateButton,
  EditButton,
  ShareButton,
  DeleteButton,
  CommentButton,
} from 'components/buttons';
import { FavoriteSummary } from 'modules/favorite/types';
import { FlexRow, sizes } from 'styles/layout';

import { ModalType } from './types';

interface Props {
  set: FavoriteSummary;
  showShareButton: boolean;
  showEditButton: boolean;
  showDeleteButton: boolean;
  handleOpenModal: (modal: ModalType, set: FavoriteSummary) => void;
  handleComment: () => void;
}

export const ActionPadding = styled(FlexRow)`
  margin-right: ${sizes.small};
`;
const Actions: React.FC<Props> = ({
  set,
  showShareButton,
  showEditButton,
  showDeleteButton,
  handleOpenModal,
  handleComment,
}) => {
  const openModal = (modal: ModalType) => {
    handleOpenModal(modal, set);
  };

  return (
    <ActionPadding>
      <DuplicateButton
        onClick={() => openModal('Create')}
        data-testid="favorite-set-action-duplicate"
      />
      <CommentButton onClick={handleComment} />
      {showEditButton && (
        <EditButton
          onClick={() => openModal('Edit')}
          data-testid="favorite-set-action-edit"
        />
      )}
      {showShareButton && (
        <ShareButton
          onClick={() => openModal('Share')}
          data-testid="favorite-set-action-share"
        />
      )}
      {showDeleteButton && (
        <DeleteButton
          data-testid="favorite-set-action-delete"
          onClick={() => openModal('Delete')}
        />
      )}
    </ActionPadding>
  );
};

export default Actions;
