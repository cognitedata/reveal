import { jsonrepair } from 'jsonrepair';
import { BaseChain, ChainInputs, LLMChain } from 'langchain/chains';
import { BaseChatModel } from 'langchain/chat_models/base';
import { PromptTemplate } from 'langchain/prompts';
import { ChainValues } from 'langchain/schema';

import { CogniteClient } from '@cognite/sdk/dist/src';

import { CopilotMessage } from './types';
import { addToCopilotEventListener, sendToCopilotEvent } from './utils';
import { addToCopilotLogs, getCopilotLogs } from './utils/logging';

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
export type ChainStage<
  I extends Record<string, any> = any,
  O extends Record<string, any> = any
> = {
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
    prevChainOutput: I
  ) => Promise<{
    abort?: boolean;
    data: Omit<O, keyof I> & Partial<I>;
    log?: string;
  }>;
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

  get messageKey() {
    const messageKey = `${[
      ...(this.fields['messages'].current || []),
    ].findLastIndex((el) => el.source === 'user')}`;
    return messageKey;
  }

  _call = async (values: ChainValues): Promise<ChainValues> => {
    addToCopilotLogs(this.messageKey, {
      key: this.constructor.name,
      content: 'Starting tool chain...',
    });
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
    let outputs: { [key: string]: any } = {};
    if (this.fields?.humanApproval) {
      const shouldContinue = await humanValidationStage(name);
      if (!shouldContinue) {
        return { value: 'emptyvalue' };
      }
    }
    try {
      for (const [i, stage] of this.stages.entries()) {
        addToCopilotLogs(this.messageKey, {
          key: stage.name,
          content: 'start',
        });
        sendToCopilotEvent('LOADING_STATUS', {
          status: stage.loadingMessage,
          stage: (i + 1) / this.stages.length,
        });
        const {
          abort,
          data,
          log = `${stage.name} completed \n\n \`\`\`json\n${JSON.stringify(
            Object.fromEntries(
              Object.entries(data).filter(
                ([_key, value]) => typeof value !== 'object'
              )
            ),
            null,
            2
          )}\n\`\`\``,
        } = await stage.run(params, outputs);
        addToCopilotLogs(this.messageKey, { key: stage.name, content: log });
        if (abort) {
          addToCopilotLogs(this.messageKey, {
            key: this.constructor.name,
            content: 'Finished tool chain...',
          });
          return { value: 'emptyvalue' };
        }
        outputs = { ...outputs, ...data };
      }
      addToCopilotLogs(this.messageKey, {
        key: this.constructor.name,
        content: 'Finished tool chain...',
      });
    } catch (e: any) {
      this.onCatch(e);
    }
    return { value: 'emptyvalue' };
  };

  onCatch = (error: Error) => {
    console.error(error);
    addToCopilotLogs(this.messageKey, {
      content: error.message,
      key: this.constructor.name,
    });
    sendToCopilotEvent('NEW_MESSAGES', [
      {
        source: 'bot',
        type: 'text',
        content: 'Unable to process message',
        chain: this.constructor.name,
        logs: getCopilotLogs(this.messageKey),
      },
    ]);
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
  key: string,
  prompt: T,
  inputVariables: {
    [key in T['input_variables'][number]]: any;
  }[],
  options: {
    maxRetries?: number;
    timeout?: number;
  } = {
    maxRetries: 1,
    timeout: 30000,
  }
) => {
  const currentRuns: Map<string, string> = new Map();
  const newChain = new LLMChain({
    llm: chain.llm,
    prompt: new PromptTemplate({
      template: prompt.template,
      inputVariables: prompt.input_variables as unknown as string[],
    }),
    // memory: chain.memory,
    outputKey: 'output',
    verbose: false,
    callbacks: [
      {
        handleChainStart(_chain, value, runId, _pid, tags) {
          currentRuns.set(value.key, runId);
          tags?.push(value.key);
          addToCopilotLogs(chain.messageKey, {
            key,
            content: 'getting results',
          });
        },
        handleChainEnd(output, runId, _pid, tags = []) {
          if (currentRuns.get(tags[0]) !== runId) {
            throw new Error('Skip');
          }
          addToCopilotLogs(chain.messageKey, {
            key,
            content: `recieved results \n\`\`\`json\n${output.output}\n\`\`\``,
          });
        },
      },
    ],
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
export async function parallelGPTCalls<T extends BaseChain>(
  inputList: ChainValues[],
  chain: T,
  maxRetries = 3,
  timeout = 3000,
  call: (chain: T, value: ChainValues) => any = (item, value) =>
    item.call(value)
): Promise<any[]> {
  const executeCall = async (
    index: number,
    retryCount = 1
  ): Promise<ChainValues> => {
    const input = inputList[index];
    let timeoutId: NodeJS.Timeout | null = null;

    const timeoutPromise = new Promise<ChainValues>((_, reject) => {
      timeoutId = setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        clearTimeout(timeoutId!);
        reject(new Error('Request timed out'));
      }, timeout);
    });
    const controller = new AbortController();

    try {
      const response = await Promise.race([
        call(chain, { ...input, signal: controller.signal }),
        timeoutPromise,
      ]);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      clearTimeout(timeoutId!);
      return response;
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      clearTimeout(timeoutId!);
      controller.abort();
      if (retryCount < maxRetries && error.message === 'Request timed out') {
        if (chain instanceof CogniteBaseChain) {
          addToCopilotLogs(chain.messageKey, {
            key: 'timeout retry',
            content: `Attempt ${retryCount + 1} after timeout of ${timeout}ms`,
          });
        }
        console.log(`Retrying call ${index} - ${retryCount}...`);
        return await executeCall(index, retryCount + 1); // Retry the call
      } else {
        return { output: '', text: '' }; // Max retries reached or timed out, return empty result
      }
    }
  };

  return await Promise.all(inputList.map((_, index) => executeCall(index)));
}
