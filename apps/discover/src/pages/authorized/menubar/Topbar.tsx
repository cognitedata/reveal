import * as React from 'react';
import { batch, useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import compact from 'lodash/compact';
import styled from 'styled-components/macro';

import { Graphic, TopBar } from '@cognite/cogs.js';
import { useTranslation } from '@cognite/react-i18n';

import GeneralFeedback from 'components/modals/general-feedback';
import navigation from 'constants/navigation';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useClearAllFilters } from 'modules/api/savedSearches/hooks/useClearAllFilters';
import { useActivePanel } from 'modules/resultPanel/selectors';
import { hideResults } from 'modules/search/actions';
import { sizes } from 'styles/layout';

import { setActivePanel } from '../../../modules/resultPanel/actions';

import { AdminSettings } from './AdminSettings';
import { SEARCH_LINK_TEXT_KEY, FAVORITES_LINK_TEXT_KEY } from './constants';
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

// const Spacer = styled.div`
//   border-left: 1px solid var(--cogs-greyscale-grey3);
//   & .cogs-topbar--item__action .action-title {
//     margin-left: 0;
//   }
//   & .cogs-btn.cogs-btn-secondary.cogs-topbar--item__action {
//     border: none;
//     padding: 0 12px;
//   }
// `;

export const PATHNAMES = {
  SEARCH: 1,
  FAVORITES: 2,
  ADMIN: 3, // Default admin base path
  'ADMIN/FEEDBACK': 3,
  'ADMIN/USER': 4,
  'ADMIN/LAYERS': 5,
  'ADMIN/PROJECT_CONFIG': 6,
};

export const Topbar: React.FC = React.memo(() => {
  const metrics = useGlobalMetrics('topbar');

  const [feedbackIsVisible, setFeedbackIsVisible] =
    React.useState<boolean>(false);
  const [active, setActive] = React.useState<number>(1);

  const { t } = useTranslation('global');
  const history = useHistory();

  const dispatch = useDispatch();
  const clearAllFilters = useClearAllFilters();
  const activePanel = useActivePanel();

  const handleNavigate =
    (page: string, id = -1) =>
    () => {
      setActive(id);
      history.push(page);
    };
  const { pathname } = useLocation();

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

  const renderTopBarLeft = React.useMemo(
    () => (
      <TopBar.Left>
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

        <TopBar.Navigation
          links={compact([
            {
              key: PATHNAMES.SEARCH,
              name: t(SEARCH_LINK_TEXT_KEY) as string,
              isActive: active === PATHNAMES.SEARCH,
              onClick: handleNavigate(
                `${navigation.SEARCH}${activePanel ? `/${activePanel}` : ''}`,
                PATHNAMES.SEARCH
              ),
            },
            {
              key: PATHNAMES.FAVORITES,
              name: t(FAVORITES_LINK_TEXT_KEY) as string,
              isActive: active === PATHNAMES.FAVORITES,
              onClick: handleNavigate(
                navigation.FAVORITES,
                PATHNAMES.FAVORITES
              ),
            },
          ])}
        />
      </TopBar.Left>
    ),
    [active, activePanel]
  );

  const renderTopBarRight = React.useMemo(
    () => (
      <TopBar.Right>
        <AdminSettings
          PATHNAMES={PATHNAMES}
          handleNavigation={(navigation: string, path: number) => {
            handleNavigate(navigation, path)();
          }}
        />
        <UserSettings />
        <Feedback feedbackOnClick={setFeedbackIsVisible} />
        <UserProfileButton />

        <LogoWrapper>
          <TenantLogo />
        </LogoWrapper>
      </TopBar.Right>
    ),
    []
  );

  return (
    <>
      <Container data-testid="top-bar">
        <TopBar>
          {renderTopBarLeft} {renderTopBarRight}
        </TopBar>
      </Container>
      {feedbackIsVisible && (
        <GeneralFeedback
          visible={feedbackIsVisible}
          onCancel={() => setFeedbackIsVisible(false)}
        />
      )}
    </>
  );
});
