import { useMemo } from 'react';

import { Flex } from '@cognite/cogs.js';
import {
  CopilotAction,
  CopilotDataModelQueryMessage,
  sendFromCopilotEvent,
} from '@cognite/llm-hub';

import { useCopilotContext } from '../../hooks/useCopilotContext';

import { Markdown } from './components/Markdown';
import { MessageBase } from './MessageBase';

export const DataQueryMessage = ({
  message,
}: {
  message: { data: CopilotDataModelQueryMessage & { source: 'bot' } };
}) => {
  const { messages } = useCopilotContext();
  const {
    data: { content, actions = [], dataModel, graphql },
  } = message;

  const openInExplorer = useMemo(() => {
    if (!window.location.pathname.includes('/explore')) {
      return {
        content: 'View in Explorer',
        icon: 'Search',
        onClick: () => {
          window.open(
            `//${
              window.location.href.includes('.dev.fusion')
                ? 'localhost:3000'
                : 'apps.cognite.com/explore'
            }/search?aiSearch=true&searchQuery=${
              [...messages.current].reverse().find((el) => el.source === 'user')
                ?.content
            }`,
            '_blank'
          );
        },
      } as CopilotAction;
    }
    return undefined;
  }, [messages]);
  const openInCanvas = useMemo(() => {
    if (window.location.pathname.includes('/industrial-canvas/canvas')) {
      return {
        content: 'Open in Canvas',
        icon: 'Add',
        onClick: () => {
          sendFromCopilotEvent('GQL_QUERY', {
            query: graphql.query,
            variables: graphql.variables,
            dataModel: dataModel,
          });
        },
      } as CopilotAction;
    }
    return undefined;
  }, [dataModel, graphql]);
  return (
    <MessageBase
      message={{
        data: {
          ...message.data,
          actions: [
            ...actions,
            ...(openInCanvas ? [openInCanvas] : []),
            ...(openInExplorer ? [openInExplorer] : []),
          ],
        },
      }}
    >
      <Flex direction="column" gap={4} style={{ marginTop: 8 }}>
        <Markdown content={content} />
      </Flex>
    </MessageBase>
  );
};
