import { CallbackManagerForLLMRun } from 'langchain/callbacks';
import { BaseChatModel, BaseChatModelParams } from 'langchain/chat_models/base';
import {
  AIMessage,
  ChatMessage,
  HumanMessage,
  SystemMessage,
  BaseMessage,
  ChatResult,
  MessageType,
  ChatGeneration,
} from 'langchain/schema';

import { CogniteClient } from '@cognite/sdk';

import {
  CreateChatCompletionRequest,
  ChatCompletionResponseMessageRoleEnum,
  ChatCompletionRequestMessage,
  CogniteChatGPTInput,
} from './types';

function messageTypeToOpenAIRole(
  type: MessageType
): ChatCompletionResponseMessageRoleEnum {
  switch (type) {
    case 'system':
      return 'system';
    case 'ai':
      return 'assistant';
    case 'human':
      return 'user';
    default:
      throw new Error(`Unknown message type: ${type}`);
  }
}

function openAIResponseToChatMessage(
  role: ChatCompletionResponseMessageRoleEnum | undefined,
  text: string
): BaseMessage {
  switch (role) {
    case 'user':
      return new HumanMessage(text);
    case 'assistant':
      return new AIMessage(text);
    case 'system':
      return new SystemMessage(text);
    default:
      return new ChatMessage(text, role ?? 'unknown');
  }
}

export class CogniteChatGPT
  extends BaseChatModel
  implements CogniteChatGPTInput
{
  temperature = 0;
  model = 'gpt-35-turbo';
  maxTokens = 2024;
  sdk: CogniteClient;

  constructor(
    sdk: CogniteClient,
    fields?: Partial<CogniteChatGPTInput> & BaseChatModelParams
  ) {
    super(fields ?? {});
    this.model = fields?.model ?? this.model;
    this.temperature = fields?.temperature ?? this.temperature;
    this.maxTokens = fields?.maxTokens ?? this.maxTokens;
    this.sdk = sdk;
  }

  /**
   * Get the parameters used to invoke the model
   */
  invocationParams(): Omit<CreateChatCompletionRequest, 'messages'> {
    return {
      model: this.model,
      temperature: this.temperature,
      maxTokens: this.maxTokens === -1 ? undefined : this.maxTokens,
    };
  }

  /** @ignore */
  _identifyingParams() {
    return {
      ...this.invocationParams(),
    };
  }

  /**
   * Get the identifying parameters for the model
   */
  identifyingParams() {
    return this._identifyingParams();
  }

  _llmType() {
    return 'cognite-chat-gpt';
  }

  /** @ignore */
  async _generate(
    messages: BaseMessage[],
    _options?: this['ParsedCallOptions'],
    _runManager?: CallbackManagerForLLMRun
  ): Promise<ChatResult> {
    const params = this.invocationParams();

    const messagesMapped: ChatCompletionRequestMessage[] = messages.map(
      (message) => ({
        role: messageTypeToOpenAIRole(message._getType()),
        content: message.text,
        name: message.name,
      })
    );

    const data = await this.completionWithRetry(
      {
        ...params,
        messages: messagesMapped,
      },
      _options?.signal
    );

    const generations: ChatGeneration[] = [];
    for (const part of data.choices) {
      const role = part.message?.role ?? undefined;
      const text = part.message?.content ?? '';
      generations.push({
        text,
        message: openAIResponseToChatMessage(role, text),
      });
    }
    return {
      generations,
      llmOutput: {},
    };
  }

  /** @ignore */
  async completionWithRetry(
    request: CreateChatCompletionRequest,
    signal?: AbortSignal | null
  ) {
    const url = `${this.sdk.getBaseUrl()}/api/v1/projects/${
      this.sdk.project
    }/gpt/chat/completions`;
    const res = await fetch(url, {
      signal,
      method: 'POST',
      headers: {
        ...this.sdk.getDefaultRequestHeaders(),
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(request),
    });
    return res.json();
  }

  /** @ignore */
  _combineLLMOutput() {
    return [];
  }
}
