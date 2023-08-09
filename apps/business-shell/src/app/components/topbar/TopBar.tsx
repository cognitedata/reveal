import { type FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  TopbarExp,
  Dropdown,
  ProductLogoProps,
  Divider,
  Flex,
  useBoolean,
} from '@cognite/cogs.js';
import { useFlag } from '@cognite/react-feature-flags';

import { useTranslation } from '../../common';

import { AppSelector } from './AppSelector';
import { HelpCenter } from './HelpCenter';
import { SiteSelection } from './SiteSelection';
import UserMenu from './UserMenu';

type Props = {
  tenant?: string;
  dropdownActionMenuItems?: JSX.Element[];
  appSwitchedEnabled?: boolean;
};

const apps = [
  {
    icon: 'InField',
    name: 'InField',
    description: 'Plan and perform field operations',
    link: '/infield',
  },

  {
    icon: 'Maintain',
    name: 'Maintain',
    description: 'Optimize and analyze maintenance plans',
    link: '/maintain',
  },
  {
    icon: 'BestDay',
    name: 'InRobot',
    description: 'Deploy and manage robots',
    link: '/inrobot',
  },
  {
    icon: 'CDF',
    name: 'Fusion',
    description: 'Integrate and manage data',
    link: '/',
  },
] as {
  icon: ProductLogoProps['type'];
  name: string;
  description?: string;
  link?: string;
}[];

export const TopBar: FC<Props> = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const { isEnabled: isExploreTabEnabled } = useFlag('CDF_BUSINESS_isEnabled', {
    forceRerender: true,
    fallback: false,
  });
  const { isEnabled: isChartsEnabled } = useFlag(
    'CDF_BUSINESS_Charts_IsEnabled',
    {
      forceRerender: true,
      fallback: false,
    }
  );
  const { isEnabled: isCanvasEnabled } = useFlag(
    'CDF_BUSINESS_Industrial_Canvas_IsEnabled',
    {
      forceRerender: true,
      fallback: false,
    }
  );

  const { isEnabled: isSiteSelectionEnabled } = useFlag('CDF_SITE_SELECTION', {
    forceRerender: true,
    fallback: false,
  });

  const navButtons = [
    {
      label: t('LABEL_EXPLORE'),
      link: '/explore',
      isEnabled: isExploreTabEnabled,
    },
    {
      link: '/canvas',
      label: t('LABEL_CANVAS'),
      isEnabled: isCanvasEnabled,
    },
    {
      link: '/charts',
      label: t('LABEL_CHARTS'),
      isEnabled: isChartsEnabled,
    },
  ];
  const { value: isAppSelectorVisible, toggle, setFalse } = useBoolean(false);

  return (
    <TopbarExp>
      <TopbarExp.Left>
        <Flex alignItems="center" gap={10}>
          <TopbarExp.AppSwitcher>
            {apps.map((app) => (
              <TopbarExp.AppSwitcherItem
                key={app.name}
                onClick={() => window.open(app.link, '_blank')}
                icon={app.icon}
                description={app?.description}
              >
                {app.name}
              </TopbarExp.AppSwitcherItem>
            ))}
          </TopbarExp.AppSwitcher>

          <TopbarExp.Logo
            size="32"
            onClick={() => navigate('/')}
            type={apps[3].icon}
          >
            {apps[3].name}
          </TopbarExp.Logo>
        </Flex>

        <Divider spacing="8px" direction="vertical" length="20px" />
        {isSiteSelectionEnabled && (
          <>
            <SiteSelection />
            <Divider spacing="8px" direction="vertical" length="20px" />
          </>
        )}
        {navButtons.map((navButton) => (
          <TopbarExp.Button
            key={navButton.label}
            toggled={location.pathname === navButton.link}
            onClick={() => {
              navigate(navButton.link);
            }}
          >
            {navButton.label}
          </TopbarExp.Button>
        ))}

        <Dropdown
          visible={isAppSelectorVisible}
          onClickOutside={setFalse}
          offset={[0, 18]}
          maxWidth={1000}
          content={<AppSelector />}
        >
          <TopbarExp.Button
            onClick={toggle}
            toggled={isAppSelectorVisible}
            icon="ChevronDown"
            iconPlacement="right"
          >
            {t('LABEL_APPS')}
          </TopbarExp.Button>
        </Dropdown>
      </TopbarExp.Left>
      <TopbarExp.Right>
        <Flex alignItems="center" gap={8}>
          <HelpCenter />
          <UserMenu />
        </Flex>
      </TopbarExp.Right>
    </TopbarExp>
  );
};
