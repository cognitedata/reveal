import { CallbackManagerForChainRun } from 'langchain/callbacks';
import { LLMChain, SequentialChain } from 'langchain/chains';
import { BaseChatModel } from 'langchain/chat_models/base';
import { PromptTemplate } from 'langchain/prompts';
import { ChainValues } from 'langchain/schema';

import { CogniteBaseChain, CogniteChainInput } from '../../types';
import { sendFromCopilotEvent } from '../../utils';

import { GRAPHQL_TYPE_TEMPLATE, GRAPHQL_QUERY_TEMPLATE } from './prompts';

export interface GraphQlChainInput extends CogniteChainInput {
  types: string[];
}

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
  types: string[];

  description = 'Good for retrieving data from data models in CDF.';

  constructor(fields: GraphQlChainInput) {
    super(fields);
    this.llm = fields.llm;
    this.types = fields.types;
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
  async _call(
    values: ChainValues,
    _runManager?: CallbackManagerForChainRun
  ): Promise<ChainValues> {
    const validKeys = this.inputKeys.every((k) => k in values);

    if (!validKeys) {
      throw new Error(
        `The following values must be provided: ${this.inputKeys}`
      );
    }

    // Chain 1: Extract relevant types
    const graphQlTypePromptTemplate = new PromptTemplate({
      template: GRAPHQL_TYPE_TEMPLATE.replace('{types}', this.types.toString()),
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

    sendFromCopilotEvent('NEW_BOT_MESSAGE', {
      type: 'text',
      content: query.query,
    });

    return query;
  }
}
