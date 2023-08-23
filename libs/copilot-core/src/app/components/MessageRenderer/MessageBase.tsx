import React, { useState } from 'react';

import styled from 'styled-components';

import {
  Avatar,
  Dropdown,
  Body,
  Button,
  Flex,
  Icon,
  Menu,
  Modal,
  Overline,
} from '@cognite/cogs.js';

import { ReactComponent as CopilotIcon } from '../../../assets/CopilotIcon.svg';
import { CopilotLogContent, CopilotMessage } from '../../../lib/types';
import { useUserProfile } from '../../hooks/useUserProfile';

import { CopilotActions } from './components/CopilotActions';
import { Markdown } from './components/Markdown';

export const MessageBase = ({
  message: { data },
  children,
  hideActions = false,
  isBot: propsIsBot = false,
}: {
  message: {
    data: CopilotMessage;
  };
  children: React.ReactNode;
  hideActions?: boolean;
  isBot?: boolean;
}) => {
  const { source } = data;
  const { data: user, isLoading } = useUserProfile();

  const [showLogs, setShowLogs] = useState(false);

  const isBot = propsIsBot || source === 'bot';

  return (
    <Wrapper gap={10}>
      {showLogs && (
        <LogsModal
          logs={data.source === 'bot' ? data.logs || [] : []}
          onClose={() => setShowLogs(false)}
        />
      )}
      {isBot ? (
        <CopilotIconWrapper alignItems="center" justifyContent="center">
          <CopilotIcon style={{ width: 16, height: 16, fill: 'white' }} />
        </CopilotIconWrapper>
      ) : isLoading ? (
        <CopilotIconWrapper
          alignItems="center"
          justifyContent="center"
          style={{ background: 'lightgrey' }}
        >
          <Icon type="Loader" />
        </CopilotIconWrapper>
      ) : (
        <Avatar text={user?.displayName} />
      )}
      <Flex direction="column" gap={16} style={{ flex: 1, overflow: 'hidden' }}>
        <Flex gap={10} alignItems="start">
          <ErrorBoundary>
            <Flex style={{ flex: 1 }}>{children}</Flex>
          </ErrorBoundary>
          {isBot && !hideActions && (
            <Dropdown
              disabled={data.source !== 'bot' || !data.logs}
              content={
                <Menu>
                  {data.source === 'bot' && data.logs ? (
                    <Menu.Item onClick={() => setShowLogs(true)}>
                      Logs
                    </Menu.Item>
                  ) : null}
                </Menu>
              }
            >
              <Button
                icon="EllipsisVertical"
                type="ghost"
                className="hover"
                aria-label="overflow menu"
              />
            </Dropdown>
          )}
        </Flex>
        {source === 'bot' && !hideActions && <CopilotActions message={data} />}
      </Flex>
    </Wrapper>
  );
};

const LogsModal = ({
  logs,
  onClose,
}: {
  logs: CopilotLogContent[];
  onClose: () => void;
}) => {
  return (
    <Modal visible onCancel={onClose} hideFooter>
      {logs.map((el, i) => {
        return (
          <Flex direction="column" gap={4} key={i}>
            <Overline size="small">
              {i} - {el.key}
            </Overline>
            <Markdown content={el.content} />
          </Flex>
        );
      })}
    </Modal>
  );
};

const Wrapper = styled(Flex)`
  overflow: hidden;
  position: relative;
  max-width: 800px;
  margin: 0 auto;

  .cogs-button.hover {
    opacity: 0;
    transition: all 0.2s;
  }
  &&:hover .cogs-button.hover {
    opacity: 1;
  }

  .thumbsdown svg {
    transform: scaleX(-1);
  }

  .cogs-select__control:not(.cogs-select__control--is-disabled) {
    border: 1px solid #e4dffb;
    background: #fff;
  }
  .cogs-select__control:not(.cogs-select__control--is-disabled):hover {
    border: 1px solid #8d6eed;
    background: #fff;
  }
  .cogs-select__control.cogs-select__control--is-focused:not(
      .cogs-select__control--is-disabled
    ) {
    border: 1px solid #6f3be4;
    background: #fff;
  }
`;

const CopilotIconWrapper = styled(Flex)`
  width: 36px;
  height: 36px;
  border-radius: 6px;
  background: radial-gradient(
    190.15% 190.15% at -12.5% 12.5%,
    #8b5cf6 0%,
    #5e28d9 100%
  );
`;
class ErrorBoundary extends React.Component<any, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    // initialize the error state
    this.state = { hasError: false };
  }

  // if an error happened, set the state to true
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch = () => {
    this.setState({ hasError: true });
  };

  render() {
    // if error happened, return a fallback component
    if (this.state.hasError) {
      return (
        <Body level={2}>
          Unable to display message, please delete and create a new chat.
        </Body>
      );
    }

    return this.props.children;
  }
}
