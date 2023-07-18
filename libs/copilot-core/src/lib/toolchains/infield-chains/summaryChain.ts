import { CallbackManagerForChainRun } from 'langchain/callbacks';
import { LLMChain } from 'langchain/chains';
import { BaseChatModel } from 'langchain/chat_models/base';
import { PromptTemplate } from 'langchain/prompts';
import { ChainValues } from 'langchain/schema';

import {
  infieldDocumentSummaryPrompt,
  copilotDestinationInfieldSummaryPrompt,
} from '@cognite/llm-hub';

import {
  CogniteBaseChain,
  CogniteChainInput,
  CopilotAction,
} from '../../types';
import { sendToCopilotEvent } from '../../utils';
import { sourceResponse } from '../../utils/types';
import { retrieveContext } from '../../utils/utils';

import {
  parallelGPTCalls,
  translateInputToEnglish,
  prepareSources,
} from './utils';

export class SummaryChain extends CogniteBaseChain {
  llm: BaseChatModel;
  outputVariables: string[];
  returnAll?: boolean | undefined;

  description = copilotDestinationInfieldSummaryPrompt.template;

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
    return infieldDocumentSummaryPrompt.input_variables;
  }

  get outputKeys(): string[] {
    return this.outputVariables;
  }

  _chainType() {
    return 'llm' as const;
  }

  /** @ignore */
  async _call(values: ChainValues, _runManager?: CallbackManagerForChainRun) {
    values.context = '';
    values.prevAnswer = '';
    values.language = '';
    const validKeys = this.inputKeys.every((k) => k in values);

    if (!validKeys) {
      throw new Error(
        `The following values must be provided: ${this.inputKeys}`
      );
    }

    //Detecting language
    const langTrans = await translateInputToEnglish(values.input, this.llm);
    values.language = langTrans.language;
    values.input = langTrans.translation;

    sendToCopilotEvent('LOADING_STATUS', {
      status: 'Retrieving information...',
    });

    //let externalAssetId = (await getExternalId()) as string;
    let externalAssetId = 'test1000_27JC0001'; //hardcoded for now, use line above when ready

    let queryContext = await retrieveContext(
      values.input,
      externalAssetId,
      this.fields.sdk,
      'vectorstore' // 'ada' or 'vectorstore' embedding
    );

    const refineSummaryPrompt = new PromptTemplate({
      template: infieldDocumentSummaryPrompt.template,
      inputVariables: this.inputKeys,
    });

    const refineSummaryChain = new LLMChain({
      llm: this.llm,
      prompt: refineSummaryPrompt,
    });

    sendToCopilotEvent('LOADING_STATUS', {
      status: 'Preparing an answer...',
    });

    let refinedResponse: ChainValues = { text: '' };
    for (let i = 0; i < queryContext.items.length; i++) {
      refinedResponse = (
        await parallelGPTCalls(
          [
            {
              input: values.input,
              context: queryContext.items[i].text,
              prevAnswer: refinedResponse.text,
              language: values.language,
            },
          ],
          refineSummaryChain
        )
      )[0];
      console.log(`Refined response ${i}: ` + refinedResponse.text);
    }

    // Return a list of the top 3 sources used to find the answer
    const sourceList: sourceResponse[] = [];
    for (let i = 0; i < 3; i++) {
      sourceList.push({
        source: queryContext.items[i].metadata.source,
        page: queryContext.items[i].metadata.page,
        text: queryContext.items[i].text,
        index: i,
      });
    }

    sendToCopilotEvent('NEW_MESSAGES', [
      {
        source: 'bot',
        type: 'text',
        content: refinedResponse.text,
        actions: [
          {
            content: 'Get source',
            onClick: () => {
              const preparedSources = prepareSources(sourceList);
              sendToCopilotEvent('NEW_MESSAGES', [
                {
                  source: 'bot',
                  type: 'text',
                  content: preparedSources[0] as string,
                  actions: preparedSources[1] as CopilotAction[],
                },
              ]);
            },
          },
        ],
        chain: this.constructor.name,
      },
    ]);

    return { refinedResponse };
  }
}
