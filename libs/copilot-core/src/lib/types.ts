import { IconType } from '@cognite/cogs.js';
import { CogniteClient } from '@cognite/sdk';

import { CogniteChainName } from './toolchains';
import { sendFromCopilotEvent, sendToCopilotEvent } from './utils';
export type CopilotLogContent = { key: string; content: string };
export type CopilotSupportedFeatureType =
  | 'Streamlit'
  | 'IndustryCanvas'
  | 'Infield'
  | 'Unsupported';

export type ActionType = 'Message' | 'ChainSelection' | 'None';

type DefaultMessage = {
  key?: number;
  content: string;
  pending?: boolean;
  actions?: CopilotAction[];
};

type DefaultBotMessage = {
  chain?: string;
} & DefaultMessage;

export type CopilotTextMessage = {
  type: 'text';
  context?: string;
} & DefaultMessage;

export type CopilotChainSelectionMessage = {
  type: 'chain';
  chain: CogniteChainName;
} & DefaultMessage;

export type CopilotErrorMessage = {
  type: 'error';
  context?: string;
} & DefaultBotMessage;

export type CopilotHumanApprovalMessage = {
  type: 'human-approval';
  approved?: boolean;
} & DefaultBotMessage;

export type CopilotCodeMessage = {
  type: 'code';
  prevContent?: string;
  highlightLines?: [number, number][]; // [start, end]
  language: 'python';
} & DefaultBotMessage;

export type _DeprecatedCopilotDataModelSelectionMessage = {
  type: 'data-model';
  space?: string;
  dataModel?: string;
  version?: string;
} & DefaultBotMessage;

export type CopilotDataModelSelectionMessage = {
  type: 'data-models';
  dataModels: { space: string; dataModel: string; version: string }[];
} & DefaultBotMessage;

export type CopilotDataModelQueryMessage = {
  type: 'data-model-query';
  dataModel: {
    externalId: string;
    version: string;
    space: string;
    view: string;
    viewVersion: string;
  };
  graphql: {
    query: string;
    variables: any;
  };
  summary?: string;
  data?: any;
} & DefaultBotMessage;

export type CopilotUserMessage =
  | CopilotTextMessage
  | CopilotChainSelectionMessage;
export type CopilotBotMessage =
  | (CopilotTextMessage & DefaultBotMessage)
  | CopilotCodeMessage
  | CopilotErrorMessage
  | CopilotDataModelSelectionMessage
  | CopilotHumanApprovalMessage
  | CopilotDataModelQueryMessage;

export type CopilotMessage =
  | (CopilotUserMessage & { source: 'user' })
  | (CopilotBotMessage & {
      source: 'bot';
      logs?: CopilotLogContent[];
    });

export type CopilotAction = {
  content: string;
  icon?: IconType;
} & (
  | {
      // THIS IS NOT CACHED, MEANING IF CHAT IS EVER RELOADED, THIS WILL BE LOST
      onClick?: (option?: string) => void;
      options?: { label: string; value: string }[];
    }
  | {
      fromCopilotEvent: Parameters<typeof sendFromCopilotEvent>;
    }
  | {
      toCopilotEvent: Parameters<typeof sendToCopilotEvent>;
    }
);

/**
 * @returns whether to accept more inputs
 */
export type ProcessMessageFunc = (
  sdk: CogniteClient,
  message: string,
  pastMessages: CopilotMessage[]
) => Promise<boolean>;

/**
 * @returns a list of actions to present to users
 */
export type GetActionsFunc = (
  sdk: CogniteClient,
  pastMessages: CopilotMessage[],
  sendMessage: (message: CopilotBotMessage) => Promise<void>
) => Promise<CopilotAction[]>;

export type CopilotEvents = {
  FromCopilot: {
    // copilot is successfully mounted
    CHAT_READY: undefined;
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
    PUSH_DOC_ID_AND_PAGE: {
      docId: string;
      page: string;
    };
    // send code to streamlit
    GQL_QUERY: {
      query: string;
      variables: any;
      dataModel: {
        externalId: string;
        space: string;
        version: string;
        view: string;
        viewVersion: string;
      };
    };
    GET_LANGUAGE: undefined;
    GET_ACTIVITIES: undefined;
    SUMMARIZE_QUERY: { summary: string };
  };
  ToCopilot: {
    // only the last message will be processed
    NEW_MESSAGES: CopilotMessage[];
    NEW_CHAT_WITH_MESSAGES: {
      chain: CogniteChainName;
      messages: CopilotMessage[];
    };
    LOADING_STATUS: {
      status: string;
      stage?: number;
    };
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
    PUSH_DOC_ID_AND_PAGE: undefined;

    // get the language of the page from infield
    GET_LANGUAGE: {
      content: string;
    };

    // get the activities from infield
    GET_ACTIVITIES: {
      content: any;
    };
    SUMMARIZE_QUERY: {
      query: string;
      variables: any;
    };
  };
};
