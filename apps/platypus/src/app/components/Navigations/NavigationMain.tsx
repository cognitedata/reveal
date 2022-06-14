import styled from 'styled-components/macro';
import { useLocation, useHistory } from 'react-router-dom';
import {
  TopBar,
  Menu,
  Avatar,
  TopBarNavigationLink,
  Icon,
} from '@cognite/cogs.js';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

export const NavigationMain = () => {
  const { pathname } = useLocation();
  const history = useHistory();
  const { t } = useTranslation('solutions');

  const tabs: Array<{
    slug: string;
    title: string;
  }> = [
    {
      slug: 'data-models',
      title: t('data_models_title', 'Data Models'),
    },
    {
      slug: 'guidetools',
      title: t('guide_tools_title', 'Guide & Tools'),
    },
    {
      slug: 'statusboard',
      title: t('statusboard_title', 'Statusboard'),
    },
  ];

  const projectManagementLinks: TopBarNavigationLink[] = tabs.map((tab) => ({
    name: tab.title,
    isActive:
      pathname.startsWith(`/${tab.slug}`) ||
      (tab.slug === 'data-models' && pathname === '/'),
    disabled: tab.slug !== 'data-models',
    tooltipProps:
      tab.slug !== 'data-models'
        ? {
            content: 'Coming Soon',
          }
        : undefined,
    onClick:
      tab.slug === 'data-models'
        ? () => {
            history.push({
              pathname: `/${tab.slug}`,
            });
          }
        : undefined,
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
              component: <Icon type="Settings" />,
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
              component: <Icon type="Help" />,
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
  .rc-tabs-tab-disabled {
    background-color: transparent;
  }
`;
