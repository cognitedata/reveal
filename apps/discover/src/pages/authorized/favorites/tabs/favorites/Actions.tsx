import * as React from 'react';

import { MoreOptionsButton } from 'components/Buttons';
import { Dropdown } from 'components/Dropdown';
import { FavoriteSummary } from 'modules/favorite/types';

import {
  DELETE_FAVORITE_CARD_BUTTON,
  DUPLICATE_FAVORITE_CARD_BUTTON,
  DUPLICATE_SET_MODAL_BUTTON_TEXT,
  EDIT_FAVORITE_CARD_BUTTON,
  SHARE_FAVORITE_CARD_BUTTON,
} from '../../constants';
import { DangerButton } from '../../elements';

import { ActionPadding, DropdownMenu } from './elements';
import { ModalType } from './types';

interface Props {
  set: FavoriteSummary;
  isFavoriteOwner: boolean;
  handleOpenModal: (modal: ModalType, set: FavoriteSummary) => void;
}

const Actions: React.FC<Props> = ({
  set,
  isFavoriteOwner,
  handleOpenModal,
}) => {
  const openModal = (modal: ModalType) => {
    handleOpenModal(modal, set);
  };

  const getFavoriteActionDropdown = () => {
    return (
      <>
        <Dropdown
          placement="bottom-end"
          content={
            <DropdownMenu data-testid={`dropdown-menu-${set.name}`}>
              <Dropdown.Item
                onClick={() => {
                  openModal(DUPLICATE_SET_MODAL_BUTTON_TEXT);
                }}
              >
                {DUPLICATE_FAVORITE_CARD_BUTTON}
              </Dropdown.Item>
              {isFavoriteOwner && (
                <>
                  <Dropdown.Item
                    onClick={() => openModal(EDIT_FAVORITE_CARD_BUTTON)}
                  >
                    {EDIT_FAVORITE_CARD_BUTTON}
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => openModal(SHARE_FAVORITE_CARD_BUTTON)}
                  >
                    {SHARE_FAVORITE_CARD_BUTTON}
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <DangerButton
                    onClick={() => openModal(DELETE_FAVORITE_CARD_BUTTON)}
                  >
                    {DELETE_FAVORITE_CARD_BUTTON}
                  </DangerButton>
                </>
              )}
            </DropdownMenu>
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
