import { FdmMixerApiService } from '@fusion/data-modeling';
import {
  BaseCallbackHandler,
  CallbackManager,
  CallbackManagerForChainRun,
} from 'langchain/callbacks';
import { LLMChain, SequentialChain } from 'langchain/chains';
import { BaseChatModel } from 'langchain/chat_models/base';
import { PromptTemplate } from 'langchain/prompts';
import { ChainValues } from 'langchain/schema';

import {
  CogniteBaseChain,
  CogniteChainInput,
  CopilotMessage,
} from '../../types';
import { addToCopilotEventListener, sendToCopilotEvent } from '../../utils';

import { GRAPHQL_TYPE_TEMPLATE, GRAPHQL_QUERY_TEMPLATE } from './prompts';

const handleChainStart = async (_: ChainValues): Promise<void> => {
  return new Promise((resolve) => {
    sendToCopilotEvent('NEW_MESSAGES', [
      {
        source: 'bot',
        type: 'data-model',
        content: 'Which data model are you referring to?',
        pending: true,
      },
    ]);

    const removeListener = addToCopilotEventListener('NEW_MESSAGES', (data) => {
      if (
        data.length === 1 &&
        data[0].type === 'data-model' &&
        !!data[0].space &&
        !!data[0].dataModel &&
        !!data[0].version &&
        !data[0].pending
      ) {
        removeListener();
        return resolve();
      }
    });
  });
};

/**
 * Chain to run queries against LLMs.
 *
 * @example
 * ```ts
 * import { LLMChain } from "langchain/chains";
 * import { CogniteChatGPT} from "@fusion/copilot-core"
 * import { PromptTemplate } from "langchain/prompts";
 *
 * const chain = new GraphQlChain({
 *   llm: new CogniteChatGPT(),
 *   returnAll: true,
 *   verbose: true,
 *   types: ['Pump', 'Valve', 'Motor']
 * });
 *
 * const prompt = 'List all valves belonging to pump 23';
 *
 * const res = await chain.call({ input: prompt});
 * ```
 */
export class GraphQlChain extends CogniteBaseChain {
  llm: BaseChatModel;
  outputVariables: string[];
  returnAll?: boolean | undefined;

  description = 'Good for retrieving data from data models in CDF.';

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

    if (getLatestDataModelMessage(this.fields.messages.current || [])) {
      return;
    }

    // TODO refactor to generic class soon
    if (this.callbacks instanceof CallbackManager) {
      this.callbacks.addHandler(
        BaseCallbackHandler.fromMethods({
          handleChainStart,
        })
      );
    } else {
      this.callbacks = [
        ...(this.callbacks || []),
        BaseCallbackHandler.fromMethods({
          handleChainStart,
        }),
      ];
    }
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
  async _call(
    values: ChainValues,
    _runManager?: CallbackManagerForChainRun
  ): Promise<ChainValues> {
    const details = getLatestDataModelMessage(
      this.fields.messages.current || []
    );
    if (!details) {
      throw new Error(`Data model not speified`);
    }
    const { space, dataModel, version } = details;
    const versions = await new FdmMixerApiService(
      this.fields.sdk
    ).getDataModelVersionsById(space, dataModel);
    const dmVersion = versions.find((el) => el.version === version);
    if (!version) {
      throw new Error(
        `Data model ${dataModel} version ${version} not found in space ${space}`
      );
    }
    console.log(dmVersion?.graphQlDml);
    // Chain 1: Extract relevant types
    const graphQlTypePromptTemplate = new PromptTemplate({
      template: GRAPHQL_TYPE_TEMPLATE,
      inputVariables: this.inputKeys,
    });
    const graphQlType = new LLMChain({
      llm: this.llm,
      prompt: graphQlTypePromptTemplate,
      outputKey: 'relevantTypes',
    });

    // Chain 2: Construct query
    const queryPromptTemplate = new PromptTemplate({
      template: GRAPHQL_QUERY_TEMPLATE,
      inputVariables: ['input', 'relevantTypes'],
    });
    const graphQlQuery = new LLMChain({
      llm: this.llm,
      prompt: queryPromptTemplate,
      outputKey: 'query',
    });

    // Chain 3: Combined chain
    const overallChain = new SequentialChain({
      chains: [graphQlType, graphQlQuery],
      verbose: this.verbose,
      inputVariables: this.inputKeys,
      outputVariables: ['query'],
    });
    const query = await overallChain.call({
      input: values.input,
    });

    sendToCopilotEvent('NEW_MESSAGES', [
      {
        source: 'bot',
        type: 'text',
        content: query.query,
        pending: false,
      },
    ]);

    return query;
  }
}

const getLatestDataModelMessage = (messages: CopilotMessage[] = []) => {
  const dataModelSelectionMsg = [...messages]
    .reverse()
    .find((el) => el.type === 'data-model');
  if (
    dataModelSelectionMsg &&
    dataModelSelectionMsg.type === 'data-model' &&
    !!dataModelSelectionMsg.space &&
    !!dataModelSelectionMsg.dataModel &&
    !!dataModelSelectionMsg.version &&
    !dataModelSelectionMsg.pending
  ) {
    return {
      space: dataModelSelectionMsg.space,
      version: dataModelSelectionMsg.version,
      dataModel: dataModelSelectionMsg.dataModel,
    };
  }
  return undefined;
};
