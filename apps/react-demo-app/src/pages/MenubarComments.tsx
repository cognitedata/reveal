import * as React from 'react';
import styled from 'styled-components/macro';
import { Dropdown, Menu, TopBar } from '@cognite/cogs.js';

import { PAGES } from './Menubar';

const MenuContainer = styled.div``;

interface Props {
  PAGES: typeof PAGES;
  handleNavigate: (navigation: PAGES) => () => void;
}

interface CommentMenuItems {
  key: number;
  name: string;
  configKey: string;
  onClick: () => void;
}

export const MenubarComments: React.FC<Props> = ({ PAGES, handleNavigate }) => {
  const [dropdownVisible, setDropdownVisible] = React.useState<boolean>(false);

  const showDropdown = () => setDropdownVisible(true);
  const hideDropdown = () => setDropdownVisible(false);

  const CommentMenuItems: CommentMenuItems[] = [
    {
      key: 1,
      name: 'Slider',
      configKey: 'slider',
      onClick: handleNavigate(PAGES.COMMENTS_SLIDER),
    },
    {
      key: 2,
      name: 'Drawer',
      configKey: 'drawer',
      onClick: handleNavigate(PAGES.COMMENTS_DRAWER),
    },
  ];

  const MenuContent = React.useMemo(
    () => (
      <MenuContainer>
        {dropdownVisible && (
          <Menu>
            {CommentMenuItems.map((item) => (
              <Menu.Item
                key={item.key}
                onClick={() => {
                  hideDropdown();
                  item.onClick();
                }}
              >
                {item.name}
              </Menu.Item>
            ))}
          </Menu>
        )}
      </MenuContainer>
    ),
    [dropdownVisible]
  );

  return (
    <Dropdown content={MenuContent}>
      <TopBar.Action onClick={showDropdown} text="Comments" />
    </Dropdown>
  );
};
