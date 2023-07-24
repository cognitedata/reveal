import { jsonrepair } from 'jsonrepair';
import { BaseChain, ChainInputs, LLMChain } from 'langchain/chains';
import { BaseChatModel } from 'langchain/chat_models/base';
import { PromptTemplate } from 'langchain/prompts';
import { ChainValues } from 'langchain/schema';

import { CogniteClient } from '@cognite/sdk/dist/src';

import { CopilotMessage } from './types';
import { addToCopilotEventListener, sendToCopilotEvent } from './utils';

export type CogniteChainInput = {
  /** LLM Wrapper to use */
  llm: BaseChatModel;
  /** Which variables should be returned as a result of executing the chain. If not specified, output of the last of the chains is used. */
  outputVariables?: string[];
  /** Whether or not to return all intermediate outputs and variables (excluding initial input variables). */
  returnAll?: boolean;
  /** Cognite Client */
  sdk: CogniteClient;

  messages: React.RefObject<CopilotMessage[]>;
  humanApproval?: boolean;
} & ChainInputs;

export type ChainType = 'llm' | 'sequential_chain';
export type ChainStage = {
  // the name (unique) of the stage
  name: string;
  // the loading message to show
  loadingMessage: string;
  run: (
    input: CogniteChainInput & {
      chainName: string;
      chainDescription: string;
      message: string;
    },
    prevChainOutput: { [key: string]: any }
  ) => Promise<{ abort?: boolean; data: any }>;
};

export abstract class CogniteBaseChain extends BaseChain {
  public abstract description: string;
  public abstract chain: ChainType;

  abstract stages: ChainStage[];

  constructor(protected fields: CogniteChainInput) {
    super(fields);
  }

  get inputKeys() {
    return [];
  }

  get outputKeys(): string[] {
    return ['value'];
  }
  _chainType() {
    return this.chain;
  }

  get llm() {
    return this.fields.llm;
  }

  _call = async (values: ChainValues): Promise<ChainValues> => {
    const validKeys = this.inputKeys.every((k) => k in values);

    if (!validKeys) {
      throw new Error(
        `The following values must be provided: ${this.inputKeys}`
      );
    }
    const name = this.constructor.name;
    const params = {
      ...this.fields,
      message: values.input as string,
      chainDescription: this.description,
      chainName: name,
    };
    const outputs: { [key: string]: any } = {};
    if (this.fields?.humanApproval) {
      const shouldContinue = await humanValidationStage(name);
      if (!shouldContinue) {
        return { value: 'emptyvalue' };
      }
    }
    for (const stage of this.stages) {
      sendToCopilotEvent('LOADING_STATUS', { status: stage.loadingMessage });
      const { abort, data } = await stage.run(params, outputs);
      if (abort) {
        return { value: 'emptyvalue' };
      }
      outputs[stage.name] = data;
    }
    return { value: 'emptyvalue' };
  };
}

const humanValidationStage = (name: string) =>
  new Promise((resolve) => {
    sendToCopilotEvent('NEW_MESSAGES', [
      {
        source: 'bot',
        type: 'human-approval',
        content: `Run "${name}" chain?`,
        pending: true,
        chain: name,
      },
    ]);
    const removeListener = addToCopilotEventListener('NEW_MESSAGES', (data) => {
      if (data.length === 1 && data[0].type === 'human-approval') {
        removeListener();
        if (data[0].approved) {
          return resolve(true);
        } else {
          sendToCopilotEvent('NEW_MESSAGES', [
            {
              source: 'bot',
              type: 'text',
              content: `Ok, I won't run "${name}" chain.`,
              pending: false,
              chain: name,
            },
          ]);
          return resolve(false);
        }
      }
    });
  });

export const callPromptChain = async <
  T extends { template: string; input_variables: any }
>(
  chain: CogniteBaseChain,
  prompt: T,
  inputVariables: {
    [key in T['input_variables'][number]]: any;
  }[],
  options: {
    maxRetries?: number;
    timeout?: number;
  } = {
    maxRetries: 3,
    timeout: 15000,
  }
) => {
  const newChain = new LLMChain({
    llm: chain.llm,
    prompt: new PromptTemplate({
      template: prompt.template,
      inputVariables: prompt.input_variables as unknown as string[],
    }),
    // memory: chain.memory,
    outputKey: 'output',
    verbose: true,
  });

  const outputs = (await parallelGPTCalls(
    inputVariables,
    newChain,
    options.maxRetries,
    options.timeout
  )) as {
    output?: string;
    text: string;
  }[];
  return outputs.map((el) => el.output || el.text);
};

export const safeConvertToJson = <T,>(outputs: string[]): T[] => {
  return outputs.map((output) => {
    try {
      return JSON.parse(output) as T;
    } catch (e) {
      return JSON.parse(jsonrepair(output.replaceAll('\n', ' '))) as T;
    }
  });
};

// Can be used for any chain, and even for single inputs to ensure retries and timeouts.
// Takes in a list of input (ChainValues objects) and a chain which should call on them.
// For each call, creates a race between the call and a timeout promise.
// Retries the call if it times out, up to maxRetries times.
// If after maxRetries the call still times out, the result is just an {text:''} object, therefore the chain implementing this should never fail.
// Returns a list of results, where the index of each result corresponds to the index of the input.
export async function parallelGPTCalls(
  inputList: ChainValues[],
  chain: LLMChain,
  maxRetries = 3,
  timeout = 8000
): Promise<ChainValues[]> {
  const results: ChainValues[] = [];
  const retries: number[] = Array(inputList.length).fill(maxRetries);

  const executeCall = async (index: number): Promise<void> => {
    const input = inputList[index];
    let timeoutId: NodeJS.Timeout | null = null;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        clearTimeout(timeoutId!);
        reject(new Error('Request timed out'));
      }, timeout);
    });

    try {
      const response = await Promise.race([chain.call(input), timeoutPromise]);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      clearTimeout(timeoutId!);
      results[index] = response;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      clearTimeout(timeoutId!);
      if (retries[index] > 0) {
        retries[index]--;
        console.log(`Retrying call ${index}...`);
        await executeCall(index); // Retry the call
      } else {
        results[index] = { output: '' }; // Max retries reached or timed out, return empty result
      }
    }
  };

  await Promise.all(inputList.map((_, index) => executeCall(index)));

  return results;
}
