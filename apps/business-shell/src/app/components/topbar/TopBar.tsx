import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';

import { TopBar as CogsTopBar, Dropdown, Tabs } from '@cognite/cogs.js';
import { useFlag } from '@cognite/react-feature-flags';

import { useTranslation } from '../../common';

import { AppSelector } from './AppSelector';
import UserMenu from './UserMenu';

type Props = {
  tenant?: string;
  dropdownActionMenuItems?: JSX.Element[];
  appSwitchedEnabled?: boolean;
};

export const TopBar: FC<Props> = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
        <UserMenu />
      </CogsTopBar.Right>
    </CogsTopBar>
  );
};
