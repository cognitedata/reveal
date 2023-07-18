import { CallbackManagerForChainRun } from 'langchain/callbacks';
import { LLMChain } from 'langchain/chains';
import { BaseChatModel } from 'langchain/chat_models/base';
import { PromptTemplate } from 'langchain/prompts';
import { ChainValues } from 'langchain/schema';

import {
  copilotDestinationInfieldDocumentQueryPrompt,
  infieldDocumentMultipleContextQueryPrompt,
  infieldDocumentSingleContextQueryPrompt,
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
  getExternalId,
  parallelGPTCalls,
  pushDocumentId,
  translateInputToEnglish,
  prepareSources,
} from './utils';

export let sourceList: sourceResponse[] = [];

export class DocumentQueryChain extends CogniteBaseChain {
  llm: BaseChatModel;
  outputVariables: string[];
  returnAll?: boolean | undefined;

  description = copilotDestinationInfieldDocumentQueryPrompt.template;

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
    return infieldDocumentMultipleContextQueryPrompt.input_variables;
  }

  get outputKeys(): string[] {
    return this.outputVariables;
  }

  _chainType() {
    return 'llm' as const;
  }

  /** @ignore */
  async _call(values: ChainValues, _runManager?: CallbackManagerForChainRun) {
    //Detecting language
    const langTrans = await translateInputToEnglish(values.input, this.llm);
    values.language = langTrans.language;
    values.input = langTrans.translation;

    console.log(values);

    sendToCopilotEvent('LOADING_STATUS', {
      status: 'Retrieving information...',
    });

    //let externalAssetId = (await getExternalId()) as string;
    let externalAssetId = 'test500_27JC0001'; //hardcoded for now, use line above when ready

    let queryContext = await retrieveContext(
      values.input,
      externalAssetId,
      this.fields.sdk,
      'vectorstore' // 'ada' or 'vectorstore' embedding
    );
    console.log(queryContext);

    // Generating answers prompt and chain initialization
    const singleQueryPromptTemplate = new PromptTemplate({
      template: infieldDocumentSingleContextQueryPrompt.template,
      inputVariables: infieldDocumentSingleContextQueryPrompt.input_variables,
    });

    const singleQueryChain = new LLMChain({
      llm: this.llm,
      prompt: singleQueryPromptTemplate,
    });

    const numDocuments = 5; // queryContext.items.length; // Can be specified
    const inputList: ChainValues[] = queryContext.items
      .slice(0, numDocuments)
      .map((i) => ({ input: values.input, context: i.text } as ChainValues));
    const returnedAnswers = await parallelGPTCalls(inputList, singleQueryChain);

    // Summarize answer prompt and chain initialization
    const summarizeAnswersPromptTemplate = new PromptTemplate({
      template: infieldDocumentMultipleContextQueryPrompt.template,
      inputVariables: infieldDocumentMultipleContextQueryPrompt.input_variables,
    });

    const summarizeAnswersQueryChain = new LLMChain({
      llm: this.llm,
      prompt: summarizeAnswersPromptTemplate,
    });
    console.log(returnedAnswers);
    // A list that can be used later on to find source of answers
    const sourceList: sourceResponse[] = [];

    let stringOfAnswers = '';
    for (let j = 0; j < returnedAnswers.length; j++) {
      if (!returnedAnswers[j].text.includes('WARNING REMOVE WARNING')) {
        const source: sourceResponse = {
          source: queryContext.items[j].metadata.source,
          page: queryContext.items[j].metadata.page,
          text: returnedAnswers[j].text,
          index: j,
        };
        stringOfAnswers += returnedAnswers[j].text + '\n\n';
        sourceList.push(source);
      }
    }
    values.context = stringOfAnswers;
    console.log(values.context);
    console.log(sourceList);

    sendToCopilotEvent('LOADING_STATUS', {
      status: 'Preparing an answer...',
    });

    // Final call for summarizing answers
    const res = (
      await parallelGPTCalls(
        [
          {
            input: values.input,
            context: values.context,
            language: values.language,
          },
        ],
        summarizeAnswersQueryChain,
        3,
        8000 // 8 seconds now to ensure that we almost always get an answer. Can definitely be lowered later on.
      )
    )[0];

    // Implement check for whether you want to be sent to the document
    // pushDocumentId('446078535171616'); // Should be the document id of where the information was found

    sendToCopilotEvent('NEW_MESSAGES', [
      {
        source: 'bot',
        type: 'text',
        content: res.text,
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

    return { res };
  }
}
