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

import { translationKeys } from '../../common';
import { useAuthContext } from '../../common/auth/AuthProvider';
import { useTranslation } from '../../hooks/useTranslation';

import { AppSelector } from './AppSelector';

type Props = {
  tenant?: string;
  dropdownActionMenuItems?: JSX.Element[];
  appSwitchedEnabled?: boolean;
};

export const TopBar: FC<Props> = () => {
  const { t } = useTranslation();
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
                    name: t(translationKeys.LABEL_EXPLORE, 'Explore'),
                    onClick: () => {
                      navigate('/explore');
                    },
                  },
                  {
                    name: t(translationKeys.LABEL_CANVAS, 'Canvas'),
                    onClick: () => {
                      navigate('/canvas');
                    },
                  },
                  {
                    name: t(translationKeys.LABEL_CHARTS, 'Charts'),
                    onClick: () => {
                      navigate('/charts');
                    },
                  },
                ]
              : []
          }
        />
        <Dropdown maxWidth={800} content={<AppSelector />}>
          <Tabs size="xlarge" activeKey="never">
            <></>
            <Tabs.Tab label="Apps" dropdown={true} style={{ marginLeft: 12 }}>
              {t(translationKeys.LABEL_APPS)}
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
                  <Menu.Item onClick={logout}>
                    {t(translationKeys.LABEL_APPS, 'Apps')}
                  </Menu.Item>
                </Menu>
              ),
            },
          ]}
        />
      </CogsTopBar.Right>
    </CogsTopBar>
  );
};
