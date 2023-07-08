import styled from 'styled-components';

import { Avatar, Button, Flex, toast } from '@cognite/cogs.js';

import { ReactComponent as CopilotIcon } from '../../../assets/CopilotIcon.svg';
import { CopilotAction } from '../../../lib/types';
import { useUserProfile } from '../../hooks/useUserProfile';

import { ResponsiveActions } from './components/ResponsiveActions';

export const MessageBase = ({
  message: { content, source },
  children,
  actions = [],
}: {
  message: { content: string; source: 'user' | 'bot' };
  children: React.ReactNode;
  actions?: CopilotAction[];
}) => {
  const { data: user } = useUserProfile();
  return (
    <Wrapper gap={10}>
      {source === 'bot' ? (
        <CopilotIconWrapper alignItems="center" justifyContent="center">
          <CopilotIcon style={{ width: 16, height: 16, fill: 'white' }} />
        </CopilotIconWrapper>
      ) : (
        <Avatar text={user?.displayName} />
      )}
      <Flex direction="column" gap={16} style={{ flex: 1, overflow: 'hidden' }}>
        <Flex gap={10} alignItems="start">
          <Flex style={{ flex: 1 }}>{children}</Flex>
          <Button
            icon="EllipsisVertical"
            type="ghost"
            className="hover"
            aria-label="overflow menu"
          />
        </Flex>
        {source === 'bot' && (
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
            {/* <Button
              icon="Copy"
              aria-label="Copy"
              type="ghost"
              size="small"
              className="ai"
              onClick={() => {
                navigator.clipboard.writeText(content);
                toast.success('Copied to clipboard');
              }}
            /> */}
            <Button
              icon="ThumbUp"
              aria-label="Give positive feedback"
              type="ghost"
              size="small"
              className="ai"
            />
            <Button
              icon="ThumbDown"
              aria-label="Give negative feedback"
              type="ghost"
              size="small"
              className="ai thumbsdown"
            />
          </Flex>
        )}
      </Flex>
    </Wrapper>
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
  .cogs-button.ai:hover {
    background: rgba(111, 59, 228, 0.18);
    color: #6f3be4;
  }

  .thumbsdown svg {
    transform: scaleX(-1);
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
