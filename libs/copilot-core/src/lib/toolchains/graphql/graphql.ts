import { CallbackManagerForChainRun } from 'langchain/callbacks';
import {
  ChainInputs,
  BaseChain,
  LLMChain,
  SequentialChain,
} from 'langchain/chains';
import { BaseChatModel } from 'langchain/chat_models/base';
import { PromptTemplate } from 'langchain/prompts';
import { ChainValues } from 'langchain/schema';

import { GRAPHQL_TYPE_TEMPLATE, GRAPHQL_QUERY_TEMPLATE } from './prompts';

export interface GraphQlChainInput extends ChainInputs {
  /** LLM Wrapper to use */
  llm: BaseChatModel;
  /** Which variables should be returned as a result of executing the chain. If not specified, output of the last of the chains is used. */
  outputVariables?: string[];
  /** Whether or not to return all intermediate outputs and variables (excluding initial input variables). */
  returnAll?: boolean;
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
 * });
 *
 * const prompt = 'List all valves belonging to pump 23';
 * const types = '[Pump, Valve, Motor]';
 *
 * const res = await chain.call({ prompt: prompt, types: types });
 * ```
 */
export class GraphQlChain extends BaseChain implements GraphQlChainInput {
  llm: BaseChatModel;
  outputVariables: string[];
  returnAll?: boolean | undefined;

  constructor(fields: GraphQlChainInput) {
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
    return ['prompt', 'types'];
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
    runManager?: CallbackManagerForChainRun
  ): Promise<ChainValues> {
    const validKeys = this.inputKeys.every((k) => k in values);

    if (!validKeys) {
      throw new Error(
        `The following values must be provided: ${this.inputKeys}`
      );
    }

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
      inputVariables: ['prompt', 'relevantTypes'],
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
      outputVariables: ['relevantTypes', 'query'],
    });
    const query = await overallChain.call({
      prompt: values.prompt,
      types: values.types,
    });

    return {
      query: query,
    };
  }
}
