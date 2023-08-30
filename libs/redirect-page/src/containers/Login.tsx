import React, { useEffect, useMemo, useState } from 'react';

import styled from 'styled-components';

import CogniteDataFusionSvg from '../assets/CogniteDataFusion.svg';
import { BREAKPOINT_WIDTH } from '../common/constants';
import { useTranslation } from '../common/i18n';
import {
  Body,
  Button,
  Colors,
  Detail,
  ErrorNotification,
  Flex,
  Icon,
  Input,
  Dropdown,
} from '../Components';

type Props = {
  setIsHelpModalVisible: (visible: boolean) => void;
};

export const Login = (props: Props) => {
  const { setIsHelpModalVisible } = props;
  const { t } = useTranslation();
  const [domain, setDomain] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isHelpVisible, setHelpStatus] = useState(false);

  const isDomainValid = useMemo(() => {
    const domainRegex = /^[a-zA-Z0-9-]+$/gi;
    return domainRegex.test(domain);
  }, [domain]);

  const onDomainSubmit = async () => {
    window.location.host = `${domain}.${window.location.host}`;
  };

  const onDomainChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDomain = event?.target.value ?? '';
    setDomain(newDomain);
    setError(null);
  };

  const onMyDomainClick = () => {
    setIsHelpModalVisible(true);
    setHelpStatus(false);
  };

  const onHelpClick = () => {
    window.open('https://docs.cognite.com/cdf/sign-in.html', '_blank')?.focus();
    setHelpStatus(false);
  };

  const submitIfEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isDomainValid) onDomainSubmit();
  };

  const feedbackHandler = () =>
    window
      .open('https://cognite.zendesk.com/hc/en-us/requests/new', '_blank')
      ?.focus();

  useEffect(() => {
    if (domain.length && !isDomainValid) setError(t('err-bad_domain'));
  }, [domain, isDomainValid, t]);

  return (
    <form
      id="org"
      onSubmit={(e) => {
        e.preventDefault();
        onDomainSubmit();
      }}
    >
      <Wrapper>
        <StyledHeader>
          <Icon type="Cognite" size={48} color="black" />
          <StyledApplicationTitle>
            {t('text-sign_into-uppercase')}
          </StyledApplicationTitle>
          <StyledApplicationImage
            alt="application logo"
            src={CogniteDataFusionSvg}
          />
        </StyledHeader>
        <StyledContent>
          <Body level={2} strong>
            {t('text-domain_name')}
          </Body>
          <Flex style={{ width: '100%', margin: '4px 0' }}>
            <Input
              name="organization"
              id="organization"
              value={domain}
              onChange={onDomainChange}
              onKeyUp={submitIfEnter}
              autoComplete="organization"
              placeholder={t('your-domain-input-placeholder')}
              style={{ marginRight: '4px' }}
              error={!!error}
            />
            <Button
              type="primary"
              icon="ArrowRight"
              disabled={!isDomainValid}
              onClick={onDomainSubmit}
              size="small"
              style={{
                width: '40px',
                minWidth: '40px',
                height: '40px',
                minHeight: '40px',
              }}
            />
          </Flex>
          {error && <ErrorNotification text={error} />}
          <UrlExample>
            <span>{window.location.protocol}&#47;&#47;</span>
            <span
              style={{ color: Colors['greyscale-grey10'], fontWeight: 500 }}
            >
              {domain.length ? domain : t('text-domain_placeholder')}.
            </span>
            <span>{window.location.host}</span>
          </UrlExample>
        </StyledContent>
        <StyledFooter>
          <Button type="link" onClick={onMyDomainClick}>
            {t('btn-info')}
          </Button>
          <Dropdown
            visible={isHelpVisible}
            label={t('btn-help')}
            content={
              <HelpList>
                <HelpListItem>
                  <StyledHelpListItemButton
                    type="link"
                    icon="Documentation"
                    iconPlacement="left"
                    onClick={onHelpClick}
                  >
                    {t('text-help-docs')}
                  </StyledHelpListItemButton>
                </HelpListItem>
                <HelpListItem>
                  <StyledHelpListItemButton
                    type="link"
                    icon="Feedback"
                    iconPlacement="left"
                    onClick={feedbackHandler}
                  >
                    {t('text-contact-support')}
                  </StyledHelpListItemButton>
                </HelpListItem>
              </HelpList>
            }
          />
        </StyledFooter>
      </Wrapper>
    </form>
  );
};

const Wrapper = styled.div`
  align-items: center;
  background-color: ${Colors.white};
  border-radius: 6px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  margin: 36px;
  max-height: calc(100% - 72px);
  padding: 36px 0 24px;
  width: ${BREAKPOINT_WIDTH}px;

  @media (max-width: ${BREAKPOINT_WIDTH}px) {
    height: 100%;
    margin: 0;
    max-height: 100%;
    border-radius: 0;
  }
`;

const UrlExample = styled(Detail)`
  color: ${Colors['greyscale-grey6']};
  max-width: 100%;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const StyledApplicationImage = styled.img`
  max-height: 24px;
  max-width: 100%;
`;

const StyledApplicationTitle = styled.div`
  color: rgb(51, 51, 51);
  font-feature-settings: normal;
  font-size: 12px;
  font-weight: 500;
  margin: 24px 0 8px;
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 24px 24px;
  width: 100%;

  @media (max-width: ${BREAKPOINT_WIDTH}px) {
    flex: 1;
  }
`;

const StyledFooter = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 24px 24px 0;
  width: 100%;
  align-items: center;
`;

const HelpList = styled('ul')`
  padding: 0;
  margin: 0;
  background: inherit;
`;

const HelpListItem = styled('li')`
  width: 100%;
  list-style: none;
  margin-bottom: 0.2em;
`;

const StyledHelpListItemButton = styled(Button)`
  width: 100%;
  justify-content: flex-start;
`;
