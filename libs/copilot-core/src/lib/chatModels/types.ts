import { CogniteClient } from '@cognite/sdk';

export declare const ChatCompletionRequestMessageRoleEnum: {
  readonly System: 'system';
  readonly User: 'user';
  readonly Assistant: 'assistant';
};
export declare type ChatCompletionRequestMessageRoleEnum =
  (typeof ChatCompletionRequestMessageRoleEnum)[keyof typeof ChatCompletionRequestMessageRoleEnum];

export declare const ChatCompletionResponseMessageRoleEnum: {
  readonly System: 'system';
  readonly User: 'user';
  readonly Assistant: 'assistant';
};
export declare type ChatCompletionResponseMessageRoleEnum =
  (typeof ChatCompletionResponseMessageRoleEnum)[keyof typeof ChatCompletionResponseMessageRoleEnum];

export declare interface CogniteChatGPTBaseInput {
  /** Sampling temperature to use */
  temperature: number;

  /**
   * Maximum number of tokens to generate in the completion.
   */
  maxTokens: number;

  /** Model name to use */
  model: string;
}

export interface CogniteChatGPTInput extends CogniteChatGPTBaseInput {
  /** ChatGPT messages to pass as a prefix to the prompt */
  prefixMessages?: ChatCompletionRequestMessage[];
  sdk?: CogniteClient;
}

/**
 *
 * @export
 * @interface ChatCompletionRequestMessage
 */
export interface ChatCompletionRequestMessage {
  /**
   * The role of the author of this message.
   * @type {string}
   * @memberof ChatCompletionRequestMessage
   */
  role: ChatCompletionRequestMessageRoleEnum;
  /**
   * The contents of the message
   * @type {string}
   * @memberof ChatCompletionRequestMessage
   */
  content: string;
  /**
   * The name of the user in a multi-user chat
   * @type {string}
   * @memberof ChatCompletionRequestMessage
   */
  name?: string;
}

/**
 *
 * @export
 * @interface CreateChatCompletionRequest
 */
export interface CreateChatCompletionRequest {
  /**
   * ID of the model to use.
   * @type {string}
   * @memberof CreateChatCompletionRequest
   */
  model: string;
  /**
   * The messages to generate chat completions for, in the [chat format](/docs/guides/chat/introduction).
   * @type {Array<ChatCompletionRequestMessage>}
   * @memberof CreateChatCompletionRequest
   */
  messages: Array<ChatCompletionRequestMessage>;
  /**
   * What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.  We generally recommend altering this or `top_p` but not both.
   * @type {number}
   * @memberof CreateChatCompletionRequest
   */
  temperature?: number | null;
  /**
   * The maximum number of tokens allowed for the generated answer. By default, the number of tokens the model can return will be (4096 - prompt tokens).
   * @type {number}
   * @memberof CreateChatCompletionRequest
   */
  maxTokens?: number;
}
