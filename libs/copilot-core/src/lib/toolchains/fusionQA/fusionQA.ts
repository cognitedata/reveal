import { ConversationChain } from 'langchain/chains';
import { PromptTemplate } from 'langchain/prompts';

import {
  copilotDestinationFusionQaPrompt,
  copilotFusionQaPrompt,
} from '@cognite/llm-hub';

import {
  ChainStage,
  ChainType,
  CogniteBaseChain,
} from '../../CogniteBaseChain';
import { sendToCopilotEvent } from '../../utils';

export class FusionQAChain extends CogniteBaseChain {
  name = 'Inquire about CDF';
  description = copilotDestinationFusionQaPrompt.template;

  chain: ChainType = 'llm';

  stages: ChainStage[] = [
    {
      name: 'llm',
      loadingMessage: 'Gathering answer...',
      run: async ({ message, llm }) => {
        const graphQlTypePromptTemplate = new PromptTemplate({
          template: copilotFusionQaPrompt.template,
          inputVariables:
            copilotFusionQaPrompt.input_variables as unknown as string[],
        });
        const chain = new ConversationChain({
          llm: llm,
          prompt: graphQlTypePromptTemplate,
          outputKey: 'response',
        });

        const response = await chain.call({
          input: message,
        });

        sendToCopilotEvent('NEW_MESSAGES', [
          {
            source: 'bot',
            type: 'text',
            content: response.response,
            chain: this.constructor.name,
          },
        ]);

        return { abort: false, data: response };
      },
    },
  ];
}
