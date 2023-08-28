import { CopilotLogContent } from '../types';

export const CopilotLogs = new Map<string, CopilotLogContent[]>();

export const addToCopilotLogs = (
  messageKey: string,
  content: CopilotLogContent
) => {
  if (!CopilotLogs.has(messageKey)) {
    CopilotLogs.set(messageKey, []);
  }
  CopilotLogs.get(messageKey)?.push(content);
};
export const getCopilotLogs = (messageKey: string) => {
  return CopilotLogs.get(messageKey) || [];
};
export const clearCopilotLog = (messageKey: string) => {
  return CopilotLogs.delete(messageKey);
};
