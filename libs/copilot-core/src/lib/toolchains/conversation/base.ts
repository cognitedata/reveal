import { BaseLanguageModel } from 'langchain/base_language';
import { ConversationChain } from 'langchain/chains';
import { BufferMemory } from 'langchain/memory';
import { PromptTemplate } from 'langchain/prompts';

import { copilotInstructionsPrompt } from '@cognite/llm-hub';

import { sendToCopilotEvent } from '../../utils';

export const createDefaultChain = (model: BaseLanguageModel) =>
  new ConversationChain({
    llm: model,
    memory: new BufferMemory({ inputKey: 'input' }),
    prompt: new PromptTemplate({
      template: copilotInstructionsPrompt.template,
      inputVariables:
        copilotInstructionsPrompt.input_variables as unknown as string[],
    }),
    callbacks: [
      {
        handleChainEnd(outputs) {
          console.log(outputs);
          sendToCopilotEvent('NEW_MESSAGES', [
            {
              source: 'bot',
              content: outputs.response,
              type: 'text',
              chain: this.constructor.name,
            },
          ]);
        },
      },
    ],
  });
