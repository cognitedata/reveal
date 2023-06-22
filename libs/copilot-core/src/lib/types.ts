import { BaseChain, ChainInputs } from 'langchain/chains';
import { BaseChatModel } from 'langchain/chat_models/base';

import { CogniteClient } from '@cognite/sdk';
export type CopilotSupportedFeatureType = 'Streamlit' | 'IndustryCanvas';

type DefaultMessage = {};

export type CopilotTextMessage = {
  type: 'text';
  content: string;
} & DefaultMessage;

export type CopilotCodeMessage = {
  type: 'code';
  content: string;
  prevContent?: string;
  highlightLines?: [number, number][]; // [start, end]
  language: 'python';
} & DefaultMessage;

export type CopilotUserMessage = CopilotTextMessage;
export type CopilotBotMessage = CopilotTextMessage | CopilotCodeMessage;

export type CopilotMessage =
  | (CopilotUserMessage & { source: 'user' })
  | (CopilotBotMessage & {
      source: 'bot';
    });

export type CopilotAction = { onClick: () => void; content: string };

/**
 * @returns whether to accept more inputs
 */
export type ProcessMessageFunc = (
  sdk: CogniteClient,
  message: string,
  pastMessages: CopilotMessage[],
  sendMessage: (message: CopilotBotMessage) => Promise<void>
) => Promise<boolean>;

/**
 * @returns a list of actions to present to users
 */
export type GetActionsFunc = (
  sdk: CogniteClient,
  pastMessages: CopilotMessage[],
  sendMessage: (message: CopilotBotMessage) => Promise<void>
) => Promise<CopilotAction[]>;

export interface CogniteChainInput extends ChainInputs {
  /** LLM Wrapper to use */
  llm: BaseChatModel;
  /** Which variables should be returned as a result of executing the chain. If not specified, output of the last of the chains is used. */
  outputVariables?: string[];
  /** Whether or not to return all intermediate outputs and variables (excluding initial input variables). */
  returnAll?: boolean;
  /** Cognite Client */
  sdk: CogniteClient;
}

export abstract class CogniteBaseChain extends BaseChain {
  public abstract description: string;
}

export type CopilotEvents = {
  FromCopilot: {
    NEW_BOT_MESSAGE: CopilotBotMessage;
    // get code from selected area
    GET_CODE_FOR_SELECTION: undefined;
    // get all code from streamlit
    GET_CODE: undefined;
    // send code to streamlit
    USE_CODE: {
      content: string;
    };
  };
  ToCopilot: {
    // get code from selected area
    GET_CODE_FOR_SELECTION: {
      content: string;
    };
    // get all code from streamlit
    GET_CODE: {
      content: string;
    };
  };
};
