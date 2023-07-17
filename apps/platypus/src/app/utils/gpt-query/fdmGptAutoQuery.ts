import {
  addFromCopilotEventListener,
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
    const removeListener = addFromCopilotEventListener('GQL_QUERY', (data) => {
      resolve(data);
      removeListener();
    });

    sendToCopilotEvent('NEW_MESSAGES', [
      {
        type: 'data-model',
        source: 'bot',
        dataModel,
        version,
        space,
        pending: false,
        content: 'I am searching on this data model',
      },
      {
        type: 'text',
        source: 'user',
        content: `I want the graphql for ${naturalLanguageQuery}`,
      },
    ]);
  });
}
