import React from 'react';

import { Dropdown, Menu } from '@cognite/cogs.js';

import { MoreOptionsButton } from 'components/Buttons';
import { FavoriteSummary } from 'modules/favorite/types';

import {
  DELETE_FAVORITE_CARD_BUTTON,
  DUPLICATE_FAVORITE_CARD_BUTTON,
  DUPLICATE_SET_MODAL_BUTTON_TEXT,
  EDIT_FAVORITE_CARD_BUTTON,
  SHARE_FAVORITE_CARD_BUTTON,
} from '../../constants';
import { DangerButton } from '../../elements';

import { ActionPadding, DropDownMenu } from './elements';
import { ModalType } from './types';

interface Props {
  set: FavoriteSummary;
  showShareButton: boolean;
  showEditButton: boolean;
  showDeleteButton: boolean;
  handleOpenModal: (modal: ModalType, set: FavoriteSummary) => void;
}

const Actions: React.FC<Props> = ({
  set,
  showShareButton,
  showEditButton,
  showDeleteButton,
  handleOpenModal,
}) => {
  const openModal = (modal: ModalType) => {
    handleOpenModal(modal, set);
  };

  const getFavoriteActionDropdown = () => {
    return (
      <>
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

  return <ActionPadding>{getFavoriteActionDropdown()}</ActionPadding>;
};

export default Actions;
