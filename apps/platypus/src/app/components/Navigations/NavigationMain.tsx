import styled from 'styled-components/macro';
import { useLocation, useHistory } from 'react-router-dom';
import { TopBar, Menu, Avatar } from '@cognite/cogs.js';
import { NavigationLink } from '@cognite/cogs.js/dist/Components/TopBar/Modules/Navigation';

const tabs: Array<{
  slug: string;
  title: string;
}> = [
  {
    slug: 'solutions',
    title: 'Solutions',
  },
  {
    slug: 'guidetools',
    title: 'Guide & Tools',
  },
  {
    slug: 'statusboard',
    title: 'Statusboard',
  },
];

export const NavigationMain = () => {
  const { pathname } = useLocation();
  const history = useHistory();

  const projectManagementLinks: NavigationLink[] = tabs.map((tab) => ({
    name: tab.title,
    isActive:
      pathname.startsWith(`/${tab.slug}`) ||
      (tab.slug === 'solutions' && pathname === '/'),
    onClick: () => {
      history.push({
        pathname: `/${tab.slug}`,
      });
    },
  }));

  const renderLinks = () => <NavigationButton links={projectManagementLinks} />;

  return (
    <TopBar>
      <TopBar.Left>
        <TopBar.Logo title="Platypus" />
        {renderLinks()}
      </TopBar.Left>
      <TopBar.Right>
        <TopBar.Actions
          actions={[
            {
              key: 'action1',
              icon: 'Settings',
              menu: (
                <Menu>
                  <Menu.Item>Settings 1</Menu.Item>
                  <Menu.Item>Settings 2</Menu.Item>
                  <Menu.Item>Settings 3</Menu.Item>
                </Menu>
              ),
            },
            {
              key: 'action2',
              icon: 'Help',
              menu: (
                <Menu>
                  <Menu.Item>Help 1</Menu.Item>
                  <Menu.Item>Help 2</Menu.Item>
                  <Menu.Item>Help 3</Menu.Item>
                </Menu>
              ),
            },
            { key: 'action3', component: <Avatar text="Platypus User" /> },
          ]}
        />
        <TopBar.AppSwitcher />
      </TopBar.Right>
    </TopBar>
  );
};

const NavigationButton = styled(TopBar.Navigation)`
  .navigation-item.active {
    margin-top: 0 !important;
    height: 100% !important;
  }
`;
