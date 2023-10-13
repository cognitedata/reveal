import { Button, Flex, Title } from '@cognite/cogs.js';

import { CopilotIcon } from '../../../assets/CopilotIcon';
import { useCopilotContext } from '../../hooks/useCopilotContext';

export const ChatHeader = ({
  style,
  hideHistory,
}: {
  style?: React.CSSProperties;
  hideHistory?: boolean;
}) => {
  const { setMode, createNewChat, isExpanded, setIsExpanded, mode } =
    useCopilotContext();
  return (
    <Flex className="header" gap={6} alignItems="center" style={style}>
      <CopilotIcon
        style={{ height: 20, width: 20, fill: 'rgba(0, 0, 0, 0.7)' }}
      />
      <Title level={5}>CogPilot</Title>
      <div style={{ flex: 1 }} />
      {mode === 'chat' ? (
        <>
          <Button
            size="small"
            icon="ListAdd"
            type="tertiary"
            onClick={() => createNewChat()}
          >
            New chat
          </Button>
          {!hideHistory && (
            <Button
              size="small"
              icon="History"
              aria-label="history"
              type="tertiary"
              onClick={() => setMode('history')}
            />
          )}
          <Button
            icon={isExpanded ? 'Collapse' : 'Expand'}
            type="tertiary"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
            onClick={() => setIsExpanded(!isExpanded)}
            size="small"
          />
        </>
      ) : (
        <Button
          size="small"
          icon="ChevronRight"
          iconPlacement="right"
          aria-label="back"
          type="tertiary"
          onClick={() => setMode('chat')}
        >
          Back to chat
        </Button>
      )}
    </Flex>
  );
};
