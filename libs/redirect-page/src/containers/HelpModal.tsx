/* eslint-disable @cognite/no-number-z-index */
import React from 'react';

import styled from 'styled-components';

import DomainExampleImg from '../assets/DomainExample.svg';
import { useTranslation } from '../common/i18n';
import { Body, Button, Colors, Flex, Title } from '../Components';

type Props = { visible: boolean; setVisible: (visible: boolean) => void };

export const HelpModal = (props: Props): JSX.Element => {
  const { visible, setVisible } = props;
  const { t } = useTranslation();

  const onOKClick = () => setVisible(false);

  return (
    <Modal visible={visible} onClick={onOKClick}>
      <Wrapper column>
        <Title level={4}>{t('text-info_title')}</Title>
        <ExampleImg src={DomainExampleImg} alt="Domain example" />
        <Panel column>
          <Body level={2}>{t('text-info_p1')}</Body>
          <Body level={2}>{t('text-info_p2a')}</Body>
          <Body level={2}>{t('text-info_p3')}</Body>
        </Panel>
        <Button type="primary" onClick={onOKClick}>
          {t('btn-info_close')}
        </Button>
      </Wrapper>
    </Modal>
  );
};

const Modal = styled.div<{ visible?: boolean }>`
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
  background-color: #1f1f1f66;
`;

const Wrapper = styled(Flex)`
  position: absolute;
  max-width: 480px;
  width: 100%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 24px;
  box-sizing: border-box;
  background-color: ${Colors.white};
  border-radius: 4px;
  z-index: 1000;
`;

const Panel = styled(Flex)`
  padding: 16px;
  margin: 12px 0;
  border-radius: 8px;
  background-color: ${Colors['midblue-8']};
  & > *:not(:last-child) {
    margin-bottom: 8px;
  }
`;

const ExampleImg = styled.img`
  margin-top: 12px;
`;
