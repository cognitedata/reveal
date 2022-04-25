import { useMemo } from 'react';
import * as React from 'react';
import { batch, useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import compact from 'lodash/compact';
import { useClearAllFilters } from 'services/savedSearches/hooks/useClearAllFilters';
import styled from 'styled-components/macro';

import { Graphic, TopBar } from '@cognite/cogs.js';
import { useTranslation } from '@cognite/react-i18n';

import navigation from 'constants/navigation';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useActivePanel } from 'modules/resultPanel/selectors';
import { hideResults } from 'modules/search/actions';
import { sizes } from 'styles/layout';

import { setActivePanel } from '../../../modules/resultPanel/actions';

import { AdminSettings } from './AdminSettings';
import {
  SEARCH_LINK_TEXT_KEY,
  FAVORITES_LINK_TEXT_KEY,
  PATHNAMES,
  // DASHBOARD_LINK_TEXT_KEY,
} from './constants';
import { Feedback } from './Feedback';
import { TenantLogo } from './TenantLogo';
import { UserProfileButton } from './UserProfileButton';
import { UserSettings } from './userSettings';

const Container = styled.div`
  position: sticky;
  width: 100%;
  top: 0;
  background: var(--cogs-white);

  & > * .navigation-item {
    font-weight: 400 !important;
  }

  & > * .logo-title {
    font-weight: 600 !important;
    color: var(--cogs-greyscale-grey9) !important;
  }
`;
const LogoWrapper = styled.div`
  margin-left: ${sizes.small};
  margin-right: ${sizes.small};
`;

const TopBarLogo = styled(TopBar.Logo)`
  cursor: pointer;
`;

export const Topbar: React.FC = () => {
  const metrics = useGlobalMetrics('topbar');
  const [activeTab, setActive] = React.useState<number>(1);
  const { t } = useTranslation('global');
  const history = useHistory();
  const dispatch = useDispatch();
  const clearAllFilters = useClearAllFilters();
  const activePanel = useActivePanel();
  const { pathname } = useLocation();

  const handleNavigate =
    (page: string, id = -1) =>
    () => {
      setActive(id);
      history.push(page);
    };

  React.useEffect(() => {
    const mapOfPathNames = Object.entries(PATHNAMES);

    const [, key] = mapOfPathNames.find(([name]) => {
      return pathname
        .toLocaleLowerCase()
        .includes(`/${name.toLocaleLowerCase()}`);
    }) || ['NOT_FOUND', -1];

    setActive(key as number);
  }, [pathname]);

  const handleLogoClick = async () => {
    metrics.track('click-discover-logo-button');
    // make sure to reset the filters
    await clearAllFilters();
    // hide the result panel
    batch(() => {
      dispatch(setActivePanel(undefined));
      dispatch(hideResults());
    });

    handleNavigate(navigation.SEARCH, PATHNAMES.SEARCH)();
  };

  const companyLogo = useMemo(() => {
    return (
      <TopBarLogo
        onClick={handleLogoClick}
        title="Cognite Discover"
        logo={
          <Graphic
            data-testid="cognite-logo"
            type="Discover"
            onClick={handleLogoClick}
            style={{
              width: 30,
              margin: '6px 10px 0 12px',
              cursor: 'pointer',
            }}
          />
        }
      />
    );
  }, []);

  const renderTopBarLeft = React.useMemo(
    () => (
      <TopBar.Left>
        {companyLogo}
        <TopBar.Navigation
          links={compact([
            {
              name: t(SEARCH_LINK_TEXT_KEY) as string,
              isActive: activeTab === PATHNAMES.SEARCH,
              onClick: handleNavigate(
                `${navigation.SEARCH}${activePanel ? `/${activePanel}` : ''}`,
                PATHNAMES.SEARCH
              ),
            },
            {
              name: t(FAVORITES_LINK_TEXT_KEY) as string,
              isActive: activeTab === PATHNAMES.FAVORITES,
              onClick: handleNavigate(
                navigation.FAVORITES,
                PATHNAMES.FAVORITES
              ),
            },
            // {
            //   key: PATHNAMES.DASHBOARD,
            //   name: t(DASHBOARD_LINK_TEXT_KEY) as string,
            //   isActive: active === PATHNAMES.DASHBOARD,
            //   onClick: handleNavigate(
            //     navigation.DASHBOARD,
            //     PATHNAMES.DASHBOARD
            //   ),
            // },
          ])}
        />
      </TopBar.Left>
    ),
    [activeTab, activePanel]
  );

  const renderTopBarRight = React.useMemo(
    () => (
      <TopBar.Right>
        <AdminSettings
          handleNavigation={(navigation: string, path: number) => {
            handleNavigate(navigation, path)();
          }}
          activeTab={activeTab}
        />

        <UserSettings />
        <Feedback />
        <UserProfileButton />

        <LogoWrapper>
          <TenantLogo />
        </LogoWrapper>
      </TopBar.Right>
    ),
    [activeTab]
  );

  return (
    <>
      <Container data-testid="top-bar">
        <TopBar>
          {renderTopBarLeft}
          {renderTopBarRight}
        </TopBar>
      </Container>
    </>
  );
};
