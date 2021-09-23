import { MessageType } from '@cognite/cogs.js';

export type BaseUrls = {
  commentServiceBaseUrl: string;
  userManagementServiceBaseUrl: string;
};

export type ExtendedMessageType = MessageType & {
  rawText?: string;
};
