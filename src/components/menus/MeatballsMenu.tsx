/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import { Button, Menu } from '@cognite/cogs.js';
import { useClickAwayListener } from 'hooks/useClickAwayListener';
import { useDispatch } from 'react-redux';
import { modalOpen } from 'store/modals/actions';
import { ModalType } from 'store/modals/types';
import { TS_FIX_ME } from 'types/core';
import { ActionsContainer, MenuContainer } from './elements';

interface Props {
  dataItem: TS_FIX_ME;
}
const MeatballsMenu: React.FC<Props> = ({ dataItem }) => {
  const dispatch = useDispatch();
  const {
    ref,
    isComponentVisible,
    setIsComponentVisible,
  } = useClickAwayListener(false);

  const handleMenuOpen = () => {
    setIsComponentVisible(() => !isComponentVisible);
  };

  const handleOpenModal = (modalType: ModalType, modalProps: TS_FIX_ME) => {
    dispatch(modalOpen({ modalType, modalProps }));
  };

  return (
    <MenuContainer ref={ref}>
      <Button
        variant="ghost"
        icon="MoreOverflowEllipsisHorizontal"
        onClick={handleMenuOpen}
      />
      <ActionsContainer>
        {isComponentVisible && (
          <Menu>
            <Menu.Item>Remove pin</Menu.Item>
            <Menu.Item>
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleOpenModal('EditSuite', { dataItem })}
              >
                Edit suite
              </div>
            </Menu.Item>
            <Menu.Item>
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleOpenModal('Delete', { dataItem })}
              >
                Delete suite
              </div>
            </Menu.Item>
            <Menu.Item>Share</Menu.Item>
          </Menu>
        )}
      </ActionsContainer>
    </MenuContainer>
  );
};

export default MeatballsMenu;
