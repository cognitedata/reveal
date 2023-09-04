import {
  ChainStage,
  ChainType,
  CogniteBaseChain,
  callPromptChain,
} from '../../CogniteBaseChain';
import {
  addToCopilotEventListener,
  sendFromCopilotEvent,
  sendToCopilotEvent,
} from '../../utils';
import { getCopilotLogs } from '../../utils/logging';

import { APP_BUILDER_PROMPT } from './prompts';

export class AppBuilderChain extends CogniteBaseChain {
  name = 'Build streamlit app';
  description = 'Allow a user to build a Streamlit python app.';
  chain: ChainType = 'sequential_chain';

  stages: ChainStage[] = [
    {
      name: 'app building',
      loadingMessage: 'Building app...',
      run: async ({ message }) => {
        let prevContent: string = '';

        const unmount = addToCopilotEventListener('GET_CODE', (e) => {
          prevContent = e.content || '';
          unmount();
        });

        sendFromCopilotEvent('GET_CODE', undefined);

        const [code] = await callPromptChain(
          this,
          'build app',
          {
            template: APP_BUILDER_PROMPT,
            input_variables: ['input'] as const,
          },
          [{ input: message }]
        );

        sendToCopilotEvent('NEW_MESSAGES', [
          {
            source: 'bot',
            type: 'code',
            language: 'python',
            content: code,
            prevContent,
            chain: this.constructor.name,
            logs: getCopilotLogs(this.messageKey),
          },
        ]);

        return { data: { code } };
      },
    },
  ];
}
