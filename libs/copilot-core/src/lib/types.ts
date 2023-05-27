export type CopilotSupportedFeatureType = 'Streamlit';

export type CopilotTextMessage = {
  type: 'text';
  content: string;
};

export type CopilotCodeMessage = {
  type: 'code';
  content: string;
  prevContent?: string;
  highlightLines?: [number, number][]; // [start, end]
  language: 'python';
  actions?: CopilotAction[];
};

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
  message: string,
  pastMessages: CopilotMessage[],
  sendMessage: (message: CopilotBotMessage) => Promise<void>
) => Promise<boolean>;

/**
 * @returns a list of actions to present to users
 */
export type GetActionsFunc = (
  pastMessages: CopilotMessage[],
  sendMessage: (message: CopilotBotMessage) => Promise<void>
) => Promise<CopilotAction[]>;

export interface CopilotEvents {
  FromCopilot: { [key in string]: unknown };
  ToCopilot: { [key in string]: unknown };
}
