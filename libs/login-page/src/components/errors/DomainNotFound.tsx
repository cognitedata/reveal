import React, { useEffect, useMemo, useState } from 'react';

import styled from 'styled-components';

import {
  Input,
  Button,
  Flex,
  Icon,
  Colors,
  Body,
  Tooltip,
} from '@cognite/cogs.js';

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
import { BREAKPOINT_WIDTH } from '../../utils';
import LoginHelp from '../login-help';

type Props = {
  didYouMean?: string[];
  isDomainHelpModalVisible: boolean;
  whatsMyDomain: (visible: boolean) => void;
  openHelpDocs: () => void;
  openChat: () => void;
};

export default function DomainNotFound({
  didYouMean,
  isDomainHelpModalVisible = false,
  whatsMyDomain,
  openHelpDocs,
  openChat,
}: Props) {
  const { t } = useTranslation();

  const baseUrl = useMemo(
    () => window.location.host.split('.').slice(1).join('.'),
    []
  );
  const [error, setError] = useState<string | null>(null);
  const [domain, setDomain] = useState<string>('');

  const isDomainValid = useMemo(() => {
    const domainRegex = /^[a-zA-Z0-9-]+$/gi;
    return domainRegex.test(domain);
  }, [domain]);

  const onDomainSubmit = async () => {
    window.location.host = `${domain}.${baseUrl}`;
  };

  const onDomainChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDomain = event?.target.value ?? '';
    setDomain(newDomain);
    setError(null);
  };

  const submitIfEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isDomainValid) onDomainSubmit();
  };

  const onDomainHelpClick = () => {
    whatsMyDomain(true);
  };

  useEffect(() => {
    if (domain.length && !isDomainValid) setError(t('error-bad-domain'));
  }, [domain, isDomainValid, t]);

  if (isDomainHelpModalVisible) {
    return <></>;
  }

  return (
    <>
      <StyledSelectSignInMethodContainer>
        <StyledHeaderContainer>
          <img height={48} width={48} src={CogniteIcon} alt="Cognite logo" />
          <StyledApplicationTitle>
            {t('sign-in-to_uppercase')}
          </StyledApplicationTitle>
          <StyledApplicationImage
            alt="application logo"
            src={CogniteDataFusionSvg}
          />
        </StyledHeaderContainer>
        <StyledContent $isBordered>
          <Container>
            <WarningAlert title={t('invalid-domain-name')}>
              <Flex direction="column" gap={8}>
                <Body level={3}>{t('error-domain-not-found')}</Body>
                {didYouMean && (
                  <>
                    <Body level={3} strong>
                      {t('did-you-mean')}
                    </Body>
                    {didYouMean.map((d) => (
                      <StyledDidYouMeanButton>
                        <StyledDidYouMeanButtonText href={`https://${d}`}>
                          <Tooltip content={d} delay={0.3}>
                            <>{d}</>
                          </Tooltip>
                        </StyledDidYouMeanButtonText>
                        <StyledDidYouMeanButtonIcon
                          size={16}
                          type="ChevronRight"
                        />
                      </StyledDidYouMeanButton>
                    ))}
                  </>
                )}
              </Flex>
            </WarningAlert>
            <p style={{ fontWeight: 500, marginBottom: 5, marginTop: 10 }}>
              {t('enter-domain')}
            </p>
            <Flex>
              <div style={{ flexGrow: 2, marginRight: 4 }}>
                <StyledDomainInput
                  autoFocus
                  error={!!error}
                  value={domain}
                  onChange={onDomainChange}
                  onKeyUp={submitIfEnter}
                  fullWidth={true}
                  type="text"
                />
              </div>
              <Button
                disabled={!domain || !!error}
                type={domain ? 'primary' : 'secondary'}
                icon="ArrowRight"
                onClick={onDomainSubmit}
              />
            </Flex>
            {error && <p style={{ color: '#AF1613' }}>{error}</p>}
            <p style={{ fontSize: 12 }}>
              https://
              <span style={{ fontWeight: 500 }}>
                {domain || t('your-domain-url-example')}
              </span>
              .{baseUrl}
            </p>
          </Container>
        </StyledContent>
        <StyledFooter>
          <Flex justifyContent="space-between" style={{ width: '100%' }}>
            <Button type="ghost-accent" onClick={onDomainHelpClick}>
              {t('what-is-my-domain-name')}
            </Button>
            <LoginHelp onClickDocs={openHelpDocs} onClickChat={openChat} />
          </Flex>
        </StyledFooter>
      </StyledSelectSignInMethodContainer>
    </>
  );
}

const Container = styled.div`
  width: 100%;
`;

const StyledDomainInput = styled(Input)`
  @media (max-width: ${BREAKPOINT_WIDTH}px) {
    font-size: 16px;
  }
`;

const StyledDidYouMeanButton = styled.button`
  align-items: center;
  background: ${Colors['decorative--grayscale--white']};
  border: none;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  padding: 12px;
`;

const StyledDidYouMeanButtonText = styled.a`
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  width: calc(100% - 20px);
  white-space: nowrap;
`;

const StyledDidYouMeanButtonIcon = styled(Icon)`
  color: ${Colors['text-icon--muted']};
`;

const StyledHeaderContainer = styled(StyledHeader)`
  padding: 36px 0 24px;
  margin: 0;
`;
