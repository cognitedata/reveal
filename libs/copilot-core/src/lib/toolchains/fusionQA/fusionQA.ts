import { CallbackManagerForChainRun } from 'langchain/callbacks';
import { ConversationChain } from 'langchain/chains';
import { BaseChatModel } from 'langchain/chat_models/base';
import { PromptTemplate } from 'langchain/prompts';
import { ChainValues } from 'langchain/schema';

import {
  copilotDestinationFusionQaPrompt,
  copilotFusionQaPrompt,
} from '@cognite/llm-hub';

import { CogniteBaseChain, CogniteChainInput } from '../../types';
import { sendToCopilotEvent } from '../../utils';

export class FusionQAChain extends CogniteBaseChain {
  llm: BaseChatModel;
  outputVariables: string[];
  returnAll?: boolean | undefined;

  description = copilotDestinationFusionQaPrompt.template;

  constructor(private fields: CogniteChainInput) {
    super(fields);
    this.llm = fields.llm;
    this.outputVariables = fields.outputVariables ?? [];
    if (this.outputVariables.length > 0 && fields.returnAll) {
      throw new Error(
        'Either specify variables to return using `outputVariables` or use `returnAll` param. Cannot apply both conditions at the same time.'
      );
    }
    this.returnAll = fields.returnAll ?? false;
  }

  get inputKeys() {
    return copilotFusionQaPrompt.input_variables;
  }

  get outputKeys(): string[] {
    return this.outputVariables;
  }

  _chainType() {
    return 'llm' as const;
  }

  /** @ignore */
  async _call(
    values: ChainValues,
    _runManager?: CallbackManagerForChainRun
  ): Promise<ChainValues> {
    const graphQlTypePromptTemplate = new PromptTemplate({
      template: copilotFusionQaPrompt.template,
      inputVariables: copilotFusionQaPrompt.input_variables,
    });
    const chain = new ConversationChain({
      llm: this.llm,
      prompt: graphQlTypePromptTemplate,
      outputKey: 'response',
    });

    const response = await chain.call({
      input: values.input,
    });

    sendToCopilotEvent('NEW_MESSAGES', [
      {
        source: 'bot',
        type: 'text',
        content: response.response,
      },
    ]);

    return response;
  }
}
