/* eslint-disable @cognite/no-number-z-index */
import React, { useEffect } from 'react';

import styled from 'styled-components';

import { selectLanguage, getLanguage } from '@cognite/cdf-i18n-utils';
import { Colors, Button, Flex, Title, Body } from '@cognite/cogs.js';

import DomainExample from '../../assets/DomainExample.svg';
import { translations, useTranslation } from '../../common/i18n';

type DomainHelpModalProps = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
};

export function DomainHelpModal({ visible, setVisible }: DomainHelpModalProps) {
  const queryLang = new URLSearchParams(window.location.search).get('lang');
  const language = getLanguage();

  useEffect(() => {
    if (
      language &&
      queryLang &&
      queryLang !== language &&
      Object.keys(translations).includes(queryLang)
    ) {
      selectLanguage(queryLang);
      window.location.reload();
    }
  }, [language, queryLang]);

  const { t } = useTranslation();
  const onOKClick = () => {
    setVisible(false);
  };
  return (
    <StyledHelpModal visible={visible} onClick={onOKClick}>
      <Wrapper>
        <Title level={4}>{t('what-is-my-domain-name')}</Title>
        <DomainExampleImg alt="application logo" src={DomainExample} />
        <Panel>
          <Body level={2}>{t('domain-name-info-p1')}</Body>
          <Body level={2}>{t('domain-name-info-p2')}</Body>
          <Body level={2}>{t('domain-name-info-p3')}</Body>
        </Panel>
        <StyledButton type="primary" onClick={onOKClick}>
          {t('got-it')}
        </StyledButton>
      </Wrapper>
    </StyledHelpModal>
  );
}

const StyledHelpModal = styled.div<{ visible?: boolean }>`
  visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  transition: opacity 260ms, visibility 260ms;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  margin: 0 auto;
`;

const Wrapper = styled(Flex)`
  display: block;
  position: absolute;
  max-width: 480px;
  width: 100%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) !important;
  padding: 24px;
  box-sizing: border-box;
  background-color: ${Colors['decorative--grayscale--white']};
  border-radius: 4px;
  z-index: 1000;
`;

const Panel = styled(Flex)`
  flex-direction: column;
  padding: 16px;
  margin: 12px 0;
  border-radius: 8px;
  background-color: ${Colors['decorative--blue--500']};
  & > *:not(:last-child) {
    margin-bottom: 8px;
  }
`;

const DomainExampleImg = styled.img`
  margin-top: 12px;
`;

const StyledButton = styled(Button)`
  width: 100%;
`;
