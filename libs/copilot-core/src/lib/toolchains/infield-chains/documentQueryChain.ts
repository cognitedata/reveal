import { CallbackManagerForChainRun } from 'langchain/callbacks';
import { LLMChain } from 'langchain/chains';
import { BaseChatModel } from 'langchain/chat_models/base';
import { PromptTemplate } from 'langchain/prompts';
import { ChainValues } from 'langchain/schema';

import { CogniteBaseChain, CogniteChainInput } from '../../types';
import { sendToCopilotEvent } from '../../utils';
import { sourceResponse } from '../../utils/types';
import { retrieveContext } from '../../utils/utils';

import {
  QUERY_SINGLE_CONTEXT_PROMPT,
  QUERY_SUMMARIZE_ANSWERS_PROMPT,
} from './prompts';
import {
  getExternalId,
  parallelGPTCalls,
  pushDocumentId,
  translateInputToEnglish,
} from './utils';

export let sourceList: sourceResponse[] = [];

export class DocumentQueryChain extends CogniteBaseChain {
  llm: BaseChatModel;
  outputVariables: string[];
  returnAll?: boolean | undefined;

  description =
    'Good for answering questions or retrieving facts about an asset. Use this chain when talking about assets, technical data, facts, etc.';

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
    return ['input', 'context', 'language'];
  }

  get outputKeys(): string[] {
    return this.outputVariables;
  }

  _chainType() {
    return 'sequential_chain' as const;
  }

  /** @ignore */
  async _call(values: ChainValues, _runManager?: CallbackManagerForChainRun) {
    values.context = '';
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

    console.log(values);

    //let externalAssetId = (await getExternalId()) as string;
    let externalAssetId = 'test27JC0001'; //hardcoded for now, use line above when ready

    let queryContext = await retrieveContext(
      values.input,
      externalAssetId,
      this.fields.sdk,
      'vectorstore' // 'ada' or 'vectorstore' embedding
    );
    console.log(queryContext);

    // Generating answers prompt and chain initialization
    const singleQueryPrompt = new PromptTemplate({
      template: QUERY_SINGLE_CONTEXT_PROMPT,
      inputVariables: this.inputKeys,
    });

    const singleQueryChain = new LLMChain({
      llm: this.llm,
      prompt: singleQueryPrompt,
    });

    const numDocuments = 5; // queryContext.items.length; // Can be specified
    const inputList: ChainValues[] = queryContext.items
      .slice(0, numDocuments)
      .map((i) => ({ input: values.input, context: i.text } as ChainValues));
    const returnedAnswers = await parallelGPTCalls(inputList, singleQueryChain);

    // Summarize answer prompt and chain initialization
    const summarizeAnswersPrompt = new PromptTemplate({
      template: QUERY_SUMMARIZE_ANSWERS_PROMPT,
      inputVariables: this.inputKeys,
    });

    const summarizeAnswersQueryChain = new LLMChain({
      llm: this.llm,
      prompt: summarizeAnswersPrompt,
    });

    // A list that can be used later on to find source of answers
    sourceList = [];
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
        5000
      )
    )[0];

    // Implement check for whether you want to be sent to the document
    // pushDocumentId('446078535171616'); // Should be the document id of where the information was found

    sendToCopilotEvent('NEW_MESSAGES', [
      {
        source: 'bot',
        type: 'text',
        content: res.text,
        chain: this.constructor.name,
      },
    ]);

    return { res };
  }
}
