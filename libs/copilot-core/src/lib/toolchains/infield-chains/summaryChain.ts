import { CallbackManagerForChainRun } from 'langchain/callbacks';
import { LLMChain } from 'langchain/chains';
import { BaseChatModel } from 'langchain/chat_models/base';
import { PromptTemplate } from 'langchain/prompts';
import { ChainValues } from 'langchain/schema';

import { CogniteBaseChain, CogniteChainInput } from '../../types';
import { sendToCopilotEvent } from '../../utils';
import { retrieveContext } from '../../utils/utils';

import {
  SUMMARY_SINGLE_CONTEXT_PROMPT,
  SUMMARY_MULTI_CONTEXT_PROMPT,
} from './prompts';
import { getExternalId, pushDocumentId } from './utils';

export class SummaryChain extends CogniteBaseChain {
  llm: BaseChatModel;
  outputVariables: string[];
  returnAll?: boolean | undefined;

  description = 'Good for providing summaries';

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
    return ['input', 'context'];
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
    const validKeys = this.inputKeys.every((k) => k in values);

    if (!validKeys) {
      throw new Error(
        `The following values must be provided: ${this.inputKeys}`
      );
    }

    //let externalAssetId = (await getExternalId()) as string;
    let externalAssetId = 'test27JC0001'; //hardcoded for now, use line above when ready

    let queryContext = await retrieveContext(
      values.input,
      externalAssetId,
      this.fields.sdk,
      'vectorstore' // 'ada' or 'vectorstore' embedding
    );

    // Generating answers prompt and chain initialization
    const singleSummaryPrompt = new PromptTemplate({
      template: SUMMARY_SINGLE_CONTEXT_PROMPT,
      inputVariables: this.inputKeys,
    });

    const singleSummaryChain = new LLMChain({
      llm: this.llm,
      prompt: singleSummaryPrompt,
    });

    const promisedAnswers: Promise<ChainValues>[] = [];
    const numDocuments = queryContext.items.length; // Can be specified, for now we use all

    // Running the GPT calls in parallel
    for (let i = 0; i < numDocuments; i++) {
      values.context = queryContext.items[i].text;
      const res = singleSummaryChain.call({
        input: values.input,
        context: values.context,
      });
      promisedAnswers.push(res);
    }
    // Awaiting all answers
    const returnedAnswers = await Promise.all(promisedAnswers);

    // Summarize answer prompt and chain initialization
    const summarizeAnswersPrompt = new PromptTemplate({
      template: SUMMARY_MULTI_CONTEXT_PROMPT,
      inputVariables: this.inputKeys,
    });

    const summarizeSummaryChain = new LLMChain({
      llm: this.llm,
      prompt: summarizeAnswersPrompt,
    });

    // Constructing a string of all answers, should filter out nulls if GPT cooperates
    values.context = returnedAnswers
      .map((answer) =>
        !answer.text.includes('WARNING REMOVE WARNING') ? answer.text : ''
      )
      .join('\n\n');
    console.log(values.context);

    // Final call for summarizing answers
    const res = await summarizeSummaryChain.call({
      input: values.input,
      context: values.context,
    });

    // Implement check for whether you want to be sent to the document
    // pushDocumentId('446078535171616'); // Should be the document id of where the information was found

    sendToCopilotEvent('NEW_MESSAGES', [
      {
        source: 'bot',
        type: 'text',
        content: res.text,
      },
    ]);

    return { res };
  }
}
