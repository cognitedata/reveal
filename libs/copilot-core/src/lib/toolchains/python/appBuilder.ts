import { CallbackManagerForChainRun } from 'langchain/callbacks';
import { LLMChain } from 'langchain/chains';
import { BaseChatModel } from 'langchain/chat_models/base';
import { PromptTemplate } from 'langchain/prompts';
import { ChainValues } from 'langchain/schema';

import { CogniteBaseChain, CogniteChainInput } from '../../types';
import {
  addToCopilotEventListener,
  sendFromCopilotEvent,
  sendToCopilotEvent,
} from '../../utils';

import { APP_BUILDER_PROMPT } from './prompts';

/**
 * Chain to run queries against LLMs.
 *
 * @example
 * ```ts
 * import { LLMChain } from "langchain/chains";
 * import { CogniteChatGPT} from "@cognite/copilot-core"
 * import { PromptTemplate } from "langchain/prompts";
 *
 * const chain = new AppBuilderChain({
 *   llm: new CogniteChatGPT(),
 *   returnAll: true,
 *   verbose: true,
 * });
 *
 * const prompt = 'List all valves belonging to pump 23';
 * const types = '[Pump, Valve, Motor]';
 *
 * const res = await chain.call({ prompt: prompt, types: types });
 * ```
 */
export class AppBuilderChain extends CogniteBaseChain {
  llm: BaseChatModel;
  outputVariables: string[];
  returnAll?: boolean | undefined;

  description = 'Allow a user to build a Streamlit python app.';

  constructor(fields: CogniteChainInput) {
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
    return ['input'];
  }

  get outputKeys(): string[] {
    return this.outputVariables;
  }

  _chainType() {
    return 'sequential_chain' as const;
  }

  /** @ignore */
  async _call(values: ChainValues, _runManager?: CallbackManagerForChainRun) {
    const validKeys = this.inputKeys.every((k) => k in values);

    if (!validKeys) {
      throw new Error(
        `The following values must be provided: ${this.inputKeys}`
      );
    }

    let prevContent: string = '';

    const unmount = addToCopilotEventListener('GET_CODE', (e) => {
      prevContent = e.content || '';
      unmount();
    });

    sendFromCopilotEvent('GET_CODE', undefined);

    const appBuilderPrompt = new PromptTemplate({
      template: APP_BUILDER_PROMPT,
      inputVariables: this.inputKeys,
    });

    const chain = new LLMChain({
      llm: this.llm,
      prompt: appBuilderPrompt,
    });

    const { text } = await chain.call({
      input: values.input,
    });

    sendToCopilotEvent('NEW_MESSAGES', [
      {
        source: 'bot',
        type: 'code',
        language: 'python',
        content: text,
        prevContent,
      },
    ]);

    return { text };
  }
}
