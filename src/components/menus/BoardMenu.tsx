/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import { Button, Menu } from '@cognite/cogs.js';
import { useClickAwayListener } from 'hooks/useClickAwayListener';
import { useDispatch } from 'react-redux';
import { RootDispatcher } from 'store/types';
import { modalOpen } from 'store/modals/actions';
import { ModalType } from 'store/modals/types';
import { Board, Suite } from 'store/suites/types';
import { ActionsContainer, MenuContainer } from './elements';

interface Props {
  board: Board;
  suite: Suite;
}
export const BoardMenu: React.FC<Props> = ({ board, suite }) => {
  const dispatch = useDispatch<RootDispatcher>();
  const {
    ref,
    isComponentVisible,
    setIsComponentVisible,
  } = useClickAwayListener(false);

  const handleMenuOpen = (event: React.MouseEvent) => {
    event.preventDefault();
    setIsComponentVisible(() => !isComponentVisible);
  };

  const handleOpenModal = (
    event: React.MouseEvent,
    modalType: ModalType,
    modalProps: any
  ) => {
    event.preventDefault();
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
                onClick={(event) =>
                  handleOpenModal(event, 'AddBoard', { board })
                }
              >
                Edit board
              </div>
            </Menu.Item>
            <Menu.Item>
              <div
                role="button"
                tabIndex={0}
                onClick={(event) =>
                  handleOpenModal(event, 'DeleteBoard', { board, suite })
                }
              >
                Delete board
              </div>
            </Menu.Item>
            <Menu.Item>Share board</Menu.Item>
          </Menu>
        )}
      </ActionsContainer>
    </MenuContainer>
  );
};
