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
  toast,
  Modal,
  Overline,
} from '@cognite/cogs.js';

import { ReactComponent as CopilotIcon } from '../../../assets/CopilotIcon.svg';
import { CopilotLogContent, CopilotMessage } from '../../../lib/types';
import { useMetrics } from '../../hooks/useMetrics';
import { useUserProfile } from '../../hooks/useUserProfile';

import { Markdown } from './components/Markdown';
import { ResponsiveActions } from './components/ResponsiveActions';

export const MessageBase = ({
  message: { data },
  children,
  hideActions = false,
}: {
  message: {
    data: CopilotMessage;
  };
  children: React.ReactNode;
  hideActions?: boolean;
}) => {
  const { content, source, actions = [] } = data;
  const { data: user, isLoading } = useUserProfile();

  const [selectedFeedback, setSelectedFeedback] = useState('');
  const [showLogs, setShowLogs] = useState(false);

  const { track } = useMetrics();
  return (
    <Wrapper gap={10}>
      {showLogs && (
        <LogsModal
          logs={data.source === 'bot' ? data.logs || [] : []}
          onClose={() => setShowLogs(false)}
        />
      )}
      {source === 'bot' ? (
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
          {source === 'bot' && !hideActions && (
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
        {source === 'bot' && !hideActions && (
          <Flex gap={4}>
            <div style={{ flex: 1 }}>
              <ResponsiveActions
                actions={[
                  ...actions,
                  {
                    content: 'Copy',
                    icon: 'ReportCopy',
                    onClick: () => {
                      navigator.clipboard.writeText(content);
                      toast.success('Copied to clipboard');
                    },
                  },
                ]}
              />
            </div>
            <Button
              icon="ThumbUp"
              aria-label="Give positive feedback"
              type="ghost"
              disabled={!!selectedFeedback}
              size="small"
              className={`ai ${
                selectedFeedback === 'positive' ? 'selected' : ''
              }`}
              onClick={() => {
                setSelectedFeedback('positive');
                track('FEEDBACK_POSITIVE', {
                  content: content,
                  chain: data.chain,
                });
              }}
            />
            <Button
              icon="ThumbDown"
              aria-label="Give negative feedback"
              type="ghost"
              disabled={!!selectedFeedback}
              size="small"
              className={`ai thumbsdown ${
                selectedFeedback === 'negative' ? 'selected' : ''
              }`}
              onClick={() => {
                setSelectedFeedback('negative');
                track('FEEDBACK_NEGATIVE', {
                  content: content,
                  chain: data.chain,
                });
              }}
            />
          </Flex>
        )}
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
  .cogs-button.ai {
    background: rgba(111, 59, 228, 0.08);
    color: #6f3be4;
  }
  .cogs-button.ai.cogs-button--disabled {
    background: transparent;
    color: #6f3be4;
    opacity: 0.5;
  }
  .cogs-button.ai.cogs-button--disabled.selected {
    opacity: 1;
  }
  .cogs-button.ai.cogs-button--disabled:hover {
    background: none;
  }
  .cogs-button.ai:hover {
    background: rgba(111, 59, 228, 0.18);
    color: #6f3be4;
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

  --cogs-surface--action--strong--hover: #632cd4;
  --cogs-surface--action--strong--default: #6f3be4;
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
