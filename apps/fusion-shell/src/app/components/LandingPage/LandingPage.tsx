import styled from 'styled-components';

import { Colors, Flex, Title } from '@cognite/cogs.js';
import { useLoginInfo } from '@cognite/login-utils';
import { useFlag } from '@cognite/react-feature-flags';

import { useTranslation } from '../../../i18n';
import { CDF_RELEASE_BANNER_HEIGHT } from '../../utils/constants';

import LearningResources from './LearningResources';
import QuickLinks from './QuickLinks';
import UserHistory from './UserHistory';

type LandingPageProps = {
  isReleaseBanner: string;
};

export default function LandingPage({
  isReleaseBanner,
}: LandingPageProps): JSX.Element {
  const { t } = useTranslation();
  const {
    isEnabled: isReleaseBannerEnabled,
    isClientReady: isReleaseBannerClientReady,
  } = useFlag('COGNITE_DATA_FUSION_RELEASE_BANNER');

  const loginInfo = useLoginInfo();
  const isRockwellDomains =
    loginInfo.data?.domain === 'ftdatamosaix' ||
    loginInfo.data?.domain === 'ftdatamosaix-dev' ||
    loginInfo.data?.domain === 'ftdatamosaix-qa' ||
    loginInfo.data?.domain === 'rockwellautomation' ||
    loginInfo.data?.domain === 'rockwelldemo';

  return (
    <SectionWrapper
      $marginTop={
        isReleaseBannerEnabled &&
        isReleaseBannerClientReady &&
        isReleaseBanner === 'true'
          ? CDF_RELEASE_BANNER_HEIGHT
          : 0
      }
    >
      <UserOnboardingSectionWrapper>
        <UserOnboardingSection direction="column" alignItems="flex-start">
          <StyledTitle level={2}>
            {isRockwellDomains
              ? t('fusion-landing-page-welcome-message-rockwell')
              : t('fusion-landing-page-welcome-message')}{' '}
          </StyledTitle>
          <QuickLinks />
        </UserOnboardingSection>
      </UserOnboardingSectionWrapper>
      <UserHistorySection alignItems="flex-start" gap={32}>
        <UserHistory isRockwellDomains={isRockwellDomains} />
        <LearningResources />
      </UserHistorySection>
    </SectionWrapper>
  );
}

const SectionWrapper = styled.div<{ $marginTop?: number }>`
  width: 100%;
  margin-top: ${({ $marginTop }) => $marginTop}px;
`;

const UserOnboardingSectionWrapper = styled.div`
  background-color: ${Colors['surface--muted--inverted']};
`;

const UserOnboardingSection = styled(Flex)`
  width: 1128px;
  margin: auto;
  padding: 48px 0;
`;

const UserHistorySection = styled(Flex)`
  width: 1128px;
  margin: auto;
  padding: 32px 0;
`;

export const StyledTitle = styled(Title)`
  &&& {
    font-weight: 500;
    color: var(--cogs-text-icon--strong--inverted);
  }
`;
