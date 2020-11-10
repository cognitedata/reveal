import React from 'react';
import { Avatar, TopBar, Menu, Graphic } from '@cognite/cogs.js';

interface Props {
  handleClick: () => void;
}

const AppHeader: React.FC<Props> = ({ handleClick }: Props) => {
  return (
    <>
      <TopBar>
        <TopBar.Left>
          <TopBar.Action icon="Hamburger" onClick={handleClick} />
          <TopBar.Logo
            title="Digital Cockpit"
            logo={
              <Graphic
                type="Cognite"
                style={{ width: 32, margin: '6px 8px 0 12px' }}
              />
            }
          />
        </TopBar.Left>
        <TopBar.Right>
          <TopBar.Search
            width={418}
            placeholder="Search for assets, timeseries, events and documents"
          />
          <TopBar.Actions
            actions={[
              {
                key: 'notification',
                icon: 'BellNotification',
              },
              {
                key: 'help',
                icon: 'Help',
                menu: (
                  <Menu>
                    <Menu.Item>Menu item 1</Menu.Item>
                    <Menu.Item>Menu item 2</Menu.Item>
                    <Menu.Item>Menu item 3</Menu.Item>
                  </Menu>
                ),
              },
              {
                key: 'user',
                component: <Avatar text="Offshore Ops" />,
              },
            ]}
          />
        </TopBar.Right>
      </TopBar>
    </>
  );
};

export default AppHeader;
