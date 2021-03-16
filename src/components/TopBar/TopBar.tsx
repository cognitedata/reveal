import React from 'react';
import { Avatar, Menu, TopBar } from '@cognite/cogs.js';
import sidecar from 'config/sidecar';

import logoSvg from 'assets/logo.svg';
import { useHistory } from 'react-router-dom';
import { useLoginStatus } from 'hooks';

const TopBarWrapper = () => {
  const { data: user } = useLoginStatus();
  const history = useHistory();

  return (
    <TopBar>
      <TopBar.Left>
        <TopBar.Logo
          title="Cognite Charts"
          onLogoClick={() =>
            history.location.pathname !== '/' && history.push('/')
          }
          logo={
            <img
              src={logoSvg}
              alt="Cognite Charts Logo"
              style={{ margin: '0 12px 0 16px' }}
            />
          }
        />
        <TopBar.Navigation links={[]} />
      </TopBar.Left>
      <TopBar.Right>
        <TopBar.Actions
          actions={[
            {
              key: 'help',
              icon: 'Help',
              name: 'Help',
              menu: (
                <Menu>
                  <Menu.Item
                    onClick={() => window.open(sidecar.privacyPolicyUrl)}
                  >
                    Privacy policy
                  </Menu.Item>
                  <Menu.Footer>
                    v. {process.env.REACT_APP_VERSION_NAME || 'local'}
                  </Menu.Footer>
                </Menu>
              ),
            },
            {
              key: 'avatar',
              component: <Avatar text={user?.user || 'Unknown'} />,
            },
          ]}
        />
      </TopBar.Right>
    </TopBar>
  );
};

export default TopBarWrapper;
