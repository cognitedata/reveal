import styled from 'styled-components';

import { Body, Button, Colors, Flex, Icon } from '@cognite/cogs.js';

import { useTranslation } from '../../../../i18n';
import { CDF_RELEASE_BANNER_HEIGHT } from '../../../utils/constants';

interface ReleaseInfoBannerProps {
  blogLink: string;
  dismissBanner: () => void;
}

const ReleaseInfoBanner = (props: ReleaseInfoBannerProps) => {
  const { blogLink, dismissBanner } = props;
  const { t } = useTranslation();

  const handleBlogLinkClick = () => {
    window.open(blogLink, '_blank')?.focus();
    dismissBanner();
  };

  return (
    <InfoBanner>
      <StyledInfoContainer
        alignItems="center"
        onClick={handleBlogLinkClick}
        gap={5}
      >
        <StyledBody level={2}>{t('release-banner-info')}</StyledBody>
        <Icon type="ExternalLink" />
      </StyledInfoContainer>
      <StyledDismissButton
        inverted
        icon="Close"
        onClick={dismissBanner}
        type="ghost-accent"
      />
    </InfoBanner>
  );
};

const InfoBanner = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding: 8px 16px;
  height: ${CDF_RELEASE_BANNER_HEIGHT}px;
  background: linear-gradient(89.99deg, #9b45b6 0%, #4520cd 100.27%);
`;

const StyledInfoContainer = styled(Flex)`
  cursor: pointer;
  color: ${Colors['text-icon--strong--inverted']};
`;

const StyledBody = styled(Body)`
  text-decoration-line: underline;
  color: ${Colors['text-icon--strong--inverted']};
`;

const StyledDismissButton = styled(Button)`
  position: absolute;
  right: 10px;
  bottom: 16px;
`;

export default ReleaseInfoBanner;
