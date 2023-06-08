import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Avatar,
  TopBar as CogsTopBar,
  Dropdown,
  Menu,
  Tabs,
} from '@cognite/cogs.js';
import { useFlag } from '@cognite/react-feature-flags';

import { useAuthContext } from '../auth/AuthProvider';

import { AppSelector } from './AppSelector';

type Props = {
  tenant?: string;
  dropdownActionMenuItems?: JSX.Element[];
  appSwitchedEnabled?: boolean;
};

export const TopBar: FC<Props> = () => {
  const navigate = useNavigate();
  const { authState, logout } = useAuthContext();
  const { isEnabled } = useFlag('CDF_BUSINESS_isEnabled', {
    forceRerender: true,
    fallback: false,
  });
  return (
    <CogsTopBar>
      <CogsTopBar.Left>
        <CogsTopBar.Logo title="Cognite" />

        <CogsTopBar.Navigation
          links={
            isEnabled
              ? [
                  {
                    name: 'Explore',
                    onClick: () => {
                      navigate('/explore');
                    },
                  },
                  {
                    name: 'Canvas',
                    onClick: () => {
                      navigate('/canvas');
                    },
                  },
                  {
                    name: 'Charts',
                    onClick: () => {
                      navigate('/canvas');
                    },
                  },
                ]
              : []
          }
        />
        <Dropdown maxWidth={800} content={<AppSelector />}>
          <Tabs size="xlarge" activeKey="never">
            <></>
            <Tabs.Tab label="Apps" dropdown={true}>
              Apps
            </Tabs.Tab>
          </Tabs>
        </Dropdown>
      </CogsTopBar.Left>

      <CogsTopBar.Right>
        <CogsTopBar.Actions
          actions={[
            {
              key: 'help',
              icon: 'Help',
            },
            {
              key: 'avatar',
              component: <Avatar text={authState.user.name} tooltip={false} />,
              menu: (
                <Menu>
                  <Menu.Item onClick={logout}>Logout</Menu.Item>
                </Menu>
              ),
            },
          ]}
        />
      </CogsTopBar.Right>
    </CogsTopBar>
  );
};
