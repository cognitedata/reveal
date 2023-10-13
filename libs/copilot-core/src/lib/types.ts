import { IconType } from '@cognite/cogs.js';
import { RelevantDocument } from '@cognite/llm-hub/dist/esm/toolchains/graphql/types';

export type DataModelAction = {
  text: string;
  type: 'data-model';
  onNext: (response: CopilotDataModelSelectionResponse) => void;
};
export type TextAction = {
  text: string;
  type: 'text';
  onNext: (prompt: CopilotTextResponse) => void;
};

export type UserAction = DataModelAction | TextAction;

export type CopilotLogContent = { key: string; content: string };

type DefaultMessage = {
  key?: number;
  content: string;
  pending?: boolean;
};
export type CopilotTextResponse = {
  type: 'text';
  context?: string;
} & DefaultMessage;

export type CopilotDataModelSelectionResponse = {
  type: 'data-models';
  dataModels: { space: string; dataModel: string; version: string }[];
} & DefaultMessage;

type DefaultBotResponse = {
  chain?: string;
  replyTo: number;
} & DefaultMessage;

export type CopilotBotTextResponse = {
  links?: RelevantDocument[];
  fileLinks?: RelevantDocument[];
} & CopilotTextResponse &
  DefaultBotResponse;

export type CopilotErrorResponse = {
  type: 'error';
  context?: string;
} & DefaultBotResponse;

export type CopilotHumanApprovalResponse = {
  type: 'human-approval';
  approved?: boolean;
} & DefaultBotResponse;

export type CopilotCodeResponse = {
  type: 'code';
  prevContent?: string;
  highlightLines?: [number, number][]; // [start, end]
  language: 'python';
} & DefaultBotResponse;

export type CopilotDataModelQueryResponse = {
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
  dataType: string;
  queryType: string;
  relevantTypes: string[];
} & DefaultBotResponse;

export type CopilotUserResponse =
  | CopilotTextResponse
  | CopilotDataModelSelectionResponse;

export type CopilotBotResponse =
  | CopilotBotTextResponse
  | CopilotCodeResponse
  | CopilotErrorResponse
  | CopilotHumanApprovalResponse
  | CopilotDataModelQueryResponse;

export type CopilotMessage =
  | (CopilotUserResponse & { source: 'user' })
  | (CopilotBotResponse & {
      source: 'bot';
      logs?: CopilotLogContent[];
    });

export type CopilotAction = {
  content: string;
  icon?: IconType;
  onClick?: (option?: string) => void;
  options?: { label: string; value: string }[];
};
