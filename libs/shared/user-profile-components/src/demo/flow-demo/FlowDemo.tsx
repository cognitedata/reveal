import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';

import { Avatar, Body, TopBar as CogsTopBar, Title } from '@cognite/cogs.js';

import { TabContent } from '../../components/tab-content/TabContent';
import { UserMenu } from '../../components/user-menu/UserMenu';
import { UserProfilePage } from '../../pages/user-profile-page/UserProfilePage';

const Topbar = (): JSX.Element => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CogsTopBar>
      <CogsTopBar.Left>
        <CogsTopBar.Logo title="Cognite" onClick={() => navigate('/')} />
      </CogsTopBar.Left>

      <CogsTopBar.Right>
        <CogsTopBar.Actions
          actions={[
            {
              key: 'avatar',
              component: <Avatar text="John" />,
              menu: (
                <UserMenu
                  userInfo={{ name: 'John', email: 'john@example.com' }}
                  onManageAccountClick={() => {
                    navigate('/profile');
                  }}
                  onLogoutClick={() => null}
                />
              ),
              hideOnSelect: true,
            },
          ]}
        />
      </CogsTopBar.Right>
    </CogsTopBar>
  );
};

export const FlowDemo = (): JSX.Element => {
  return (
    <BrowserRouter>
      <Topbar />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <br />
              <Title level={4}>Home Page</Title>
              <Body>
                Click the <b>Avatar</b> on top right and then click{' '}
                <b>Manage Account</b>
              </Body>
            </>
          }
        />
        <Route
          path="/profile"
          element={
            <UserProfilePage
              userInfo={{ name: 'John', email: 'john@example.com' }}
              selectedLanguage={{ code: 'en', label: 'English | en' }}
              supportedLanguages={[{ code: 'en', label: 'English | en' }]}
              onLanguageChange={() => null}
              additionalTabs={[
                {
                  key: 'custom-tab',
                  icon: 'Placeholder',
                  title: 'Custom Tab',
                  content: (
                    <TabContent.Container>
                      <TabContent.Body>Custom Tab Content</TabContent.Body>
                    </TabContent.Container>
                  ),
                },
              ]}
              additionalTabsCategoryLabel="Custom Tabs"
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default FlowDemo;
