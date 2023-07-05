import { BaseChain, ChainInputs } from 'langchain/chains';
import { BaseChatModel } from 'langchain/chat_models/base';
import { ChainValues } from 'langchain/schema';

import { CogniteClient } from '@cognite/sdk';

import { addToCopilotEventListener, sendToCopilotEvent } from './utils';
export type CopilotSupportedFeatureType =
  | 'Streamlit'
  | 'IndustryCanvas'
  | 'Infield';

type DefaultMessage = {
  key?: number;
  content: string;
  pending?: boolean;
};

export type CopilotTextMessage = {
  type: 'text';
} & DefaultMessage;

export type CopilotHumanApprovalMessage = {
  type: 'human-approval';
  approved?: boolean;
} & DefaultMessage;

export type CopilotCodeMessage = {
  type: 'code';
  prevContent?: string;
  highlightLines?: [number, number][]; // [start, end]
  language: 'python';
} & DefaultMessage;

export type CopilotDataModelSelectionMessage = {
  type: 'data-model';
  space?: string;
  dataModel?: string;
  version?: string;
} & DefaultMessage;

export type CopilotDataModelQueryMessage = {
  type: 'data-model-query';
  space: string;
  dataModel: string;
  version: string;
  query: string;
} & DefaultMessage;

export type CopilotUserMessage = CopilotTextMessage;
export type CopilotBotMessage =
  | CopilotTextMessage
  | CopilotCodeMessage
  | CopilotDataModelSelectionMessage
  | CopilotHumanApprovalMessage
  | CopilotDataModelQueryMessage;

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

  messages: React.RefObject<CopilotMessage[]>;
  humanApproval?: boolean;
}

export abstract class CogniteBaseChain extends BaseChain {
  public abstract description: string;

  constructor(fields: CogniteChainInput) {
    super(fields);
    const name = this.constructor.name;
    if (!!fields?.humanApproval) {
      this.callbacks = [
        {
          async handleChainStart(_: ChainValues) {
            return new Promise((resolve, reject) => {
              sendToCopilotEvent('NEW_MESSAGES', [
                {
                  source: 'bot',
                  type: 'human-approval',
                  content: `Run "${name}" chain?`,
                  pending: true,
                },
              ]);
              const removeListener = addToCopilotEventListener(
                'NEW_MESSAGES',
                (data) => {
                  if (data.length === 1 && data[0].type === 'human-approval') {
                    removeListener();
                    if (data[0].approved) {
                      return resolve();
                    } else {
                      sendToCopilotEvent('NEW_MESSAGES', [
                        {
                          source: 'bot',
                          type: 'text',
                          content: `Ok, I won't run "${name}" chain.`,
                          pending: false,
                        },
                      ]);
                      return reject();
                    }
                  }
                }
              );
            });
          },
        },
      ];
    }
  }
}

export type CopilotEvents = {
  FromCopilot: {
    // get code from selected area
    GET_CODE_FOR_SELECTION: undefined;
    // get all code from streamlit
    GET_CODE: undefined;
    // send code to streamlit
    USE_CODE: {
      content: string;
    };

    // get the external asset id from infield
    GET_EXTERNAL_ASSETID: undefined;
    // send documentId to infield
    PUSH_DOC_ID: {
      content: string;
    };
    // send code to streamlit
    GQL_QUERY: {
      query: string;
      arguments: any;
    };
    GET_LANGUAGE: undefined;
  };
  ToCopilot: {
    // only the last message will be processed
    NEW_MESSAGES: CopilotMessage[];
    // get code from selected area
    GET_CODE_FOR_SELECTION: {
      content: string;
    };
    // get all code from streamlit
    GET_CODE: {
      content: string;
    };
    // get the external asset id from infield
    GET_EXTERNAL_ASSETID: {
      content: string;
    };
    // get response from infield
    PUSH_DOC_ID: undefined;

    // get the language of the page from infield
    GET_LANGUAGE: {
      content: string;
    };
  };
};
