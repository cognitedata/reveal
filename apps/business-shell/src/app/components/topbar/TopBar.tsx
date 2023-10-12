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

import { TranslationKeys, useTranslation } from '../../common';

import { AppSelector } from './AppSelector';
import { HelpCenter } from './HelpCenter';
import { SiteSelection } from './SiteSelection';
import UserMenu from './UserMenu';

type Props = {
  tenant?: string;
  dropdownActionMenuItems?: JSX.Element[];
  appSwitchedEnabled?: boolean;
};

export const getAppsInfo = (_t: (key: TranslationKeys) => string) => {
  return [
    {
      icon: 'Maintain',
      name: _t('MAINTAIN_APP_TITLE'),
      description: _t('MAINTAIN_APP_SUBTITLE'),
      link: 'https://maintain.cogniteapp.com/',
    },
    {
      icon: 'BestDay',
      name: _t('INROBOT_APP_TITLE'),
      description: _t('INROBOT_APP_SUBTITLE'),
      link: 'https://inrobot.cogniteapp.com/',
    },
    {
      icon: 'CDF',
      name: _t('DATA_OPS_APP_TITLE'),
      description: _t('DATA_OPS_APP_SUBTITLE'),
      link: 'https://fusion.cognite.com/',
    },
  ] as {
    icon: ProductLogoProps['type'];
    name: string;
    description: string;
    link: string;
  }[];
};

export const TopBar: FC<Props> = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const { isEnabled: isExploreTabEnabled } = useFlag('CDF_BUSINESS_isEnabled', {
    forceRerender: true,
    fallback: false,
  });
  // const { isEnabled: isChartsEnabled } = useFlag(
  //   'CDF_BUSINESS_Charts_IsEnabled',
  //   {
  //     forceRerender: true,
  //     fallback: false,
  //   }
  // );
  // const { isEnabled: isCanvasEnabled } = useFlag(
  //   'CDF_BUSINESS_Industrial_Canvas_IsEnabled',
  //   {
  //     forceRerender: true,
  //     fallback: false,
  //   }
  // );

  // const { isEnabled: isSiteSelectionEnabled } = useFlag('CDF_SITE_SELECTION', {
  //   forceRerender: true,
  //   fallback: false,
  // });

  const navButtons = [
    {
      label: t('LABEL_EXPLORE'),
      link: '/explore',
      isEnabled: isExploreTabEnabled,
    },
    // {
    //   link: '/canvas',
    //   label: t('LABEL_CANVAS'),
    //   isEnabled: isCanvasEnabled,
    // },
    // {
    //   link: '/charts',
    //   label: t('LABEL_CHARTS'),
    //   isEnabled: isChartsEnabled,
    // },
  ];
  const { value: isAppSelectorVisible, toggle, setFalse } = useBoolean(false);
  const apps = getAppsInfo(t);

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

          <TopbarExp.Logo size="32" onClick={() => navigate('/')} type="CDF">
            Fusion
          </TopbarExp.Logo>
        </Flex>

        <Divider spacing="8px" direction="vertical" length="20px" />

        <SiteSelection />

        <Flex className="navigation-bar" gap={12}>
          {navButtons.map((navButton) => (
            <TopbarExp.Button
              key={navButton.label}
              toggled={location.pathname.startsWith(navButton.link)}
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
        </Flex>
      </TopbarExp.Left>
      <TopbarExp.Right>
        <Flex alignItems="center" className="user-menu" gap={8}>
          <HelpCenter />
          <UserMenu />
        </Flex>
      </TopbarExp.Right>
    </TopbarExp>
  );
};
