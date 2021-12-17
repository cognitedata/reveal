import React from 'react';

import { Dropdown, Menu } from '@cognite/cogs.js';

import {
  DuplicateButton,
  EditButton,
  ShareButton,
  DeleteButton,
  CommentButton,
  MoreOptionsButton,
} from 'components/buttons';
import { FavoriteSummary, ViewModeType } from 'modules/favorite/types';

import {
  DELETE_FAVORITE_CARD_BUTTON,
  DUPLICATE_FAVORITE_CARD_BUTTON,
  DUPLICATE_SET_MODAL_BUTTON_TEXT,
  EDIT_FAVORITE_CARD_BUTTON,
  SHARE_FAVORITE_CARD_BUTTON,
} from '../../constants';

import { ActionPadding, DangerButton, DropDownMenu } from './elements';
import { ModalType } from './types';

interface Props {
  set: FavoriteSummary;
  showShareButton: boolean;
  showEditButton: boolean;
  showDeleteButton: boolean;
  handleOpenModal: (modal: ModalType, set: FavoriteSummary) => void;
  handleComment: () => void;
  viewMode?: string;
}

const Actions: React.FC<Props> = ({
  set,
  showShareButton,
  showEditButton,
  showDeleteButton,
  handleOpenModal,
  handleComment,
  viewMode,
}) => {
  const openModal = (modal: ModalType) => {
    handleOpenModal(modal, set);
  };

  const getRowModeAction = () => {
    return (
      <>
        <DuplicateButton
          onClick={() => openModal(DUPLICATE_SET_MODAL_BUTTON_TEXT)}
          data-testid="favorite-set-action-duplicate"
        />
        <CommentButton onClick={handleComment} />
        {showEditButton && (
          <EditButton
            onClick={() => openModal(EDIT_FAVORITE_CARD_BUTTON)}
            data-testid="favorite-set-action-edit"
          />
        )}
        {showShareButton && (
          <ShareButton
            onClick={() => openModal(SHARE_FAVORITE_CARD_BUTTON)}
            data-testid="favorite-set-action-share"
          />
        )}
        {showDeleteButton && (
          <DeleteButton
            data-testid="favorite-set-action-delete"
            onClick={() => openModal(DELETE_FAVORITE_CARD_BUTTON)}
          />
        )}
      </>
    );
  };

  const getCardModeAction = () => {
    return (
      <>
        <CommentButton size="default" onClick={handleComment} />
        <Dropdown
          openOnHover
          placement="bottom-end"
          content={
            <DropDownMenu data-testid={`dropdown-menu-${set.name}`}>
              <Menu.Item
                onClick={() => {
                  openModal(DUPLICATE_SET_MODAL_BUTTON_TEXT);
                }}
              >
                {DUPLICATE_FAVORITE_CARD_BUTTON}
              </Menu.Item>
              {showEditButton && (
                <Menu.Item onClick={() => openModal(EDIT_FAVORITE_CARD_BUTTON)}>
                  {EDIT_FAVORITE_CARD_BUTTON}
                </Menu.Item>
              )}

              {showShareButton && (
                <Menu.Item
                  onClick={() => openModal(SHARE_FAVORITE_CARD_BUTTON)}
                >
                  {SHARE_FAVORITE_CARD_BUTTON}
                </Menu.Item>
              )}

              {showDeleteButton && (
                <>
                  <Menu.Divider />
                  <DangerButton
                    onClick={() => openModal(DELETE_FAVORITE_CARD_BUTTON)}
                  >
                    {DELETE_FAVORITE_CARD_BUTTON}
                  </DangerButton>
                </>
              )}
            </DropDownMenu>
          }
        >
          <MoreOptionsButton
            type="ghost"
            size="default"
            data-testid={`menu-button-${set.name}`}
          />
        </Dropdown>
      </>
    );
  };

  return (
    <ActionPadding>
      {viewMode === ViewModeType.Row ? getRowModeAction() : getCardModeAction()}
    </ActionPadding>
  );
};

export default Actions;
