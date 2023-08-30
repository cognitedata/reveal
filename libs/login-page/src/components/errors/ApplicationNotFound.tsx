import styled from 'styled-components';

import { Body, Button, Colors, Icon, Flex } from '@cognite/cogs.js';

import CogniteDataFusionSvg from '../../assets/CogniteDataFusion.svg';
import CogniteIcon from '../../assets/CogniteIcon.svg';
import { useTranslation } from '../../common/i18n';
import {
  StyledApplicationImage,
  StyledApplicationTitle,
  StyledContent,
  StyledFooter,
  StyledHeader,
  StyledSelectSignInMethodContainer,
  WarningAlert,
} from '../../components/containers';
import LoginHelp from '../../components/login-help';
import { redirectToSelectDomainPage } from '../../utils';

type Props = {
  fullPage?: boolean;
};

const ApplicationNotFound = ({ fullPage = false }: Props): JSX.Element => {
  const { t } = useTranslation();

  const openAuthConfigDocsHandler = () =>
    window.open('https://docs.cognite.com/cdf/access/', '_blank')?.focus();

  const openSupportChatHandler = () =>
    window
      .open('https://cognite.zendesk.com/hc/en-us/requests/new', '_blank')
      ?.focus();

  if (!fullPage) {
    return (
      <StyledContainer>
        <WarningAlert title={t('error-missing-configuration')}>
          <Flex direction="column" gap={8}>
            <Body level={3}>{t('error-missing-configuration-info')}</Body>
            <Button type="secondary" onClick={openAuthConfigDocsHandler}>
              {t('auth-configuration-docs')}
              <StyledIconContainer>
                <Icon type="Documentation" />
              </StyledIconContainer>
            </Button>
            <Button type="secondary" onClick={openSupportChatHandler}>
              {t('contact-support-chat')}
              <StyledIconContainer>
                <Icon type="Feedback" />
              </StyledIconContainer>
            </Button>
          </Flex>
        </WarningAlert>
      </StyledContainer>
    );
  }

  return (
    <StyledSelectSignInMethodContainer>
      <StyledHeader>
        <img height={48} width={48} src={CogniteIcon} alt="Cognite logo" />
        <StyledApplicationTitle>
          {t('sign-in-to_uppercase')}
        </StyledApplicationTitle>
        <StyledApplicationImage
          alt="application logo"
          src={CogniteDataFusionSvg}
        />
      </StyledHeader>
      <StyledContent $isBordered>
        <StyledContainer>
          <WarningAlert title={t('error-missing-configuration')}>
            <Flex direction="column" gap={8}>
              <Body level={3}>{t('error-missing-configuration-info')}</Body>
            </Flex>
          </WarningAlert>
        </StyledContainer>
      </StyledContent>
      <StyledFooter>
        <Flex justifyContent="space-between" style={{ width: '100%' }}>
          <Button
            icon="Login"
            iconPlacement="right"
            onClick={redirectToSelectDomainPage}
            type="ghost-accent"
          >
            {t('sign-in-other-domain')}
          </Button>
          <LoginHelp
            onClickChat={openSupportChatHandler}
            onClickDocs={openAuthConfigDocsHandler}
          />
        </Flex>
      </StyledFooter>
    </StyledSelectSignInMethodContainer>
  );
};

const StyledContainer = styled.div`
  width: 100%;
`;
const StyledIconContainer = styled.div`
  margin: 0 12px 0 6px;
  color: ${Colors['decorative--blue--500']};
`;

export default ApplicationNotFound;
