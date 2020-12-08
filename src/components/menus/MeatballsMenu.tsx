/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import { Button, Menu } from '@cognite/cogs.js';
import { useClickAwayListener } from 'hooks/useClickAwayListener';
import { ActionsContainer, MenuContainer } from './elements';

interface Props {
  openModal: (value: string) => void;
}
const MeatballsMenu: React.FC<Props> = ({ openModal }: Props) => {
  const {
    ref,
    isComponentVisible,
    setIsComponentVisible,
  } = useClickAwayListener(false);

  const handleMenuOpen = () => {
    setIsComponentVisible(() => !isComponentVisible);
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
              <div role="button" tabIndex={0} onClick={() => openModal('edit')}>
                Edit suite
              </div>
            </Menu.Item>
            <Menu.Item>
              <div
                role="button"
                tabIndex={0}
                onClick={() => openModal('delete')}
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
