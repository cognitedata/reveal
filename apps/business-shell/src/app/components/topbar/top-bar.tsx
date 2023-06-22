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

import { useTranslation } from '../../common';
import { useAuthContext } from '../../common/auth/AuthProvider';

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
                    name: t('LABEL_EXPLORE'),
                    onClick: () => {
                      navigate('/explore');
                    },
                  },
                  {
                    name: t('LABEL_CANVAS'),
                    onClick: () => {
                      navigate('/canvas');
                    },
                  },
                  {
                    name: t('LABEL_CHARTS'),
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
              {t('LABEL_APPS')}
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
                  <Menu.Item onClick={logout}>{t('LABEL_APPS')}</Menu.Item>
                </Menu>
              ),
            },
          ]}
        />
      </CogsTopBar.Right>
    </CogsTopBar>
  );
};
