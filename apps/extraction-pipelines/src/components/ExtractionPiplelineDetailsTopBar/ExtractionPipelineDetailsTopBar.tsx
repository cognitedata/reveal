import React, { useMemo } from 'react';

import styled from 'styled-components';

import {
  Body,
  Button,
  Colors,
  Dropdown,
  DropdownProps,
  Flex,
  Heading,
  Icon,
} from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import { MQTTSourceWithJobMetrics } from '../../hooks/hostedExtractors';
import { PAGE_WIDTH } from '../../utils/constants';
import { doesJobStatusHaveErrorType } from '../../utils/hostedExtractors';
type ExtractionPipelineDetailsTopBarProps = {
  extraContent?: React.ReactNode;
  onGoBack: () => void;
  optionsDropdownProps?: Omit<DropdownProps, 'children'>;
  title: string;
  source: MQTTSourceWithJobMetrics;
};
export const ExtractionPipelineDetailsTopBar = ({
  extraContent,
  onGoBack,
  optionsDropdownProps,
  title,
  source,
}: ExtractionPipelineDetailsTopBarProps) => {
  const { t } = useTranslation();
  const status = useMemo(() => {
    const isErrorState = source.jobs.some((job) =>
      doesJobStatusHaveErrorType(job)
    );

    const isPaused = source.jobs.every((job) => job.status === 'paused');

    if (isErrorState) {
      return t('mqtt-connection-status-error');
    } else if (isPaused) {
      return t('mqtt-connection-status-paused');
    } else {
      return t('mqtt-connection-status-running');
    }
  }, [source, t]);

  return (
    <Container>
      <HeaderContainer direction="column">
        <Button type="ghost" icon="ArrowLeft" onClick={onGoBack}>
          {t('all-connections')}
        </Button>
        <Flex style={{ width: '100%' }}>
          <Status
            type="Status"
            size={24}
            runningStatus={status === 'running'}
          />
          <Flex direction="column" style={{ flexGrow: 1 }}>
            <Heading level={3}>{title}</Heading>
            <Body muted size="small">
              {t('mqtt-connection-status-text', { status: status })}
            </Body>
          </Flex>
          <Dropdown {...optionsDropdownProps}>
            <Button icon="EllipsisHorizontal" />
          </Dropdown>
        </Flex>
      </HeaderContainer>
      <TabContainer>{extraContent}</TabContainer>
    </Container>
  );
};

const Container = styled.div`
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  background: var(
    --header-gradient,
    linear-gradient(180deg, #fff 56.82%, rgba(245, 246, 252, 0.16) 100%),
    #f9f9fc
  );
  height: 214px;
  width: 100%;
  border-bottom: 1px solid ${Colors['border--interactive--default']};
`;

const HeaderContainer = styled(Flex)`
  padding: 40px 134px 24px 134px;
  box-sizing: content-box;
  width: ${PAGE_WIDTH}px;
  flex: 1 1 0;
  justify-content: space-between;
  align-items: flex-start;
  margin: 0 auto;
`;

const TabContainer = styled.div`
  height: 43px;
  padding: 0 134px;
  box-sizing: content-box;
  backdrop-filter: blur(5px);
  width: ${PAGE_WIDTH}px;
  margin: 0 auto;
`;

const Status = styled(Icon)<{ runningStatus: boolean }>`
  padding-top: 2px;
  margin-right: 8px;
  color: ${(props) =>
    props.runningStatus
      ? Colors['text-icon--status-success']
      : Colors['text-icon--status-undefined']};
`;
