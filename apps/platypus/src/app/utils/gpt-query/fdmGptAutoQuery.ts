import {
  addToCopilotEventListener,
  sendToCopilotEvent,
} from '@fusion/copilot-core';

export async function fetchGptAutoQuery(
  naturalLanguageQuery: string,
  dataModel: string,
  version: string,
  space: string
) {
  return new Promise<{
    query: string;
    variables: any;
  }>((resolve) => {
    const removeListener = addToCopilotEventListener(
      'NEW_MESSAGES',
      (messages) => {
        for (const message of messages) {
          if (message.source === 'bot' && message.type === 'data-model-query') {
            resolve(message.graphql);
            removeListener();
          }
        }
      }
    );

    sendToCopilotEvent('NEW_CHAT_WITH_MESSAGES', {
      chain: 'GraphQlChain',
      messages: [
        {
          type: 'data-models',
          source: 'bot',
          dataModels: [{ dataModel, version, space }],
          pending: false,
          content: 'I am searching on this data model',
        },
        {
          type: 'text',
          source: 'user',
          content: `I want the graphql for ${naturalLanguageQuery}`,
        },
      ],
    });
  });
}
