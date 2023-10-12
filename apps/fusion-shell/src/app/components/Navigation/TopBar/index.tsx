import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { trackEvent } from '@cognite/cdf-route-tracker';
import { createLink } from '@cognite/cdf-utilities';
import { Colors, Flex } from '@cognite/cogs.js';
import { useLoginInfo } from '@cognite/login-utils';
import { useFlag } from '@cognite/react-feature-flags';

import { ReactComponent as RockwellLogo } from '../../../../assets/RockwellLogo.svg';
import { releaseBlogPostUrl } from '../../../utils/constants';
import { useSubApp } from '../../../utils/hooks';
import { updatePageTitle } from '../../../utils/utils';
import { ZIndexLayer } from '../../../utils/zIndex';
import GlobalSearch from '../../GlobalSearch';
import { OverflowMenu } from '../OverflowMenu';
import { ProjectSwitcher } from '../ProjectSwitcher';
import ReleaseInfoBanner from '../ReleaseInfoBanner';

import AppIconButton from './AppIconButton';
import CDFHelpCenter from './CDFHelpCenter';
import Divider from './Divider';
import TopBarSections from './TopBarSections';
import UserMenu from './UserMenu';

type TopBarProps = {
  isReleaseBanner: string;
  setReleaseBanner: (value: string) => void;
};

const TopBar = ({
  isReleaseBanner,
  setReleaseBanner,
}: TopBarProps): JSX.Element => {
  const {
    isEnabled: isReleaseBannerEnabled,
    isClientReady: isReleaseBannerClientReady,
  } = useFlag('COGNITE_DATA_FUSION_RELEASE_BANNER');

  const navigate = useNavigate();
  const subApp = useSubApp();

  const loginInfo = useLoginInfo();
  const isRockwellDomains =
    loginInfo.data?.domain === 'ftdatamosaix' ||
    loginInfo.data?.domain === 'ftdatamosaix-dev' ||
    loginInfo.data?.domain === 'ftdatamosaix-qa' ||
    loginInfo.data?.domain === 'ftdatamosaix-preprod' ||
    loginInfo.data?.domain === 'ftdatamosaix-demo' ||
    loginInfo.data?.domain === 'rockwellautomation' ||
    loginInfo.data?.domain === 'rockwelldemo';

  const handleDismissBanner = () => {
    trackEvent('Navigation.CDF.Release.Banner.Click');
    localStorage.setItem('isCDFReleaseBanner', 'false');
    setReleaseBanner('false');
  };

  const appIconClickHandler = () => {
    trackEvent('Navigation.TopBar.Logo.Click');
    navigate(createLink('/'));
    updatePageTitle();
  };

  const homeButtonClickHandler = () => {
    trackEvent('Navigation.TopBar.Home.Click');
    navigate(createLink('/'));
    updatePageTitle();
  };

  return (
    <NavigationWrapper>
      {/* Display release banner only in home page */}
      {isReleaseBannerEnabled &&
        isReleaseBannerClientReady &&
        isReleaseBanner === 'true' &&
        subApp === '/' && (
          <ReleaseInfoBanner
            blogLink={releaseBlogPostUrl}
            dismissBanner={handleDismissBanner}
          />
        )}
      <StyledTopBarContainer background={isRockwellDomains ? '#242A2D' : ''}>
        <AppIconButton
          logo={isRockwellDomains ? <RockwellLogo /> : null}
          onClick={appIconClickHandler}
        />
        <Divider left={12} />
        <ProjectSwitcher />
        <Divider />
        <StyledTopBarSectionsWrapper>
          <TopBarSections onClickHome={homeButtonClickHandler} />
        </StyledTopBarSectionsWrapper>
        <GlobalSearch />
        <StyledOverflowMenuWrapper>
          <OverflowMenu />
        </StyledOverflowMenuWrapper>
        <Divider />
        <Flex gap={8}>
          <CDFHelpCenter isRockwellDomain={isRockwellDomains} />
          <UserMenu />
        </Flex>
      </StyledTopBarContainer>
    </NavigationWrapper>
  );
};

const StyledOverflowMenuWrapper = styled.div``;

const StyledTopBarSectionsWrapper = styled.div``;

const StyledTopBarContainer = styled.div<{ background?: string }>`
  align-items: center;
  background-color: ${(props) =>
    props.background || Colors['surface--muted--inverted']};
  color: ${Colors['text-icon--strong--inverted']};
  display: flex;
  height: 100%;
  padding: 10px 12px;
  width: 100%;

  ${StyledOverflowMenuWrapper} {
    display: none;
  }

  @media (max-width: 1280px) {
    ${StyledTopBarSectionsWrapper} {
      display: none;
    }

    ${StyledOverflowMenuWrapper} {
      display: unset;
    }
  }
`;

const NavigationWrapper = styled.div`
  z-index: ${ZIndexLayer.Navigation};
  position: fixed;
  top: 0;
  width: 100%;
  height: var(--cdf-ui-navigation-height);
`;

export default TopBar;
