import { useCallback } from 'react';

import { trackCopilotUsage } from '@cognite/llm-hub';
import { useSDK } from '@cognite/sdk-provider';

import { useCopilotContext } from './useCopilotContext';

export const useMetrics = () => {
  const { messages, isExpanded } = useCopilotContext();
  const sdk = useSDK();

  const track = useCallback(
    (...params: Parameters<typeof trackCopilotUsage>) => {
      const latestUserMessage = [
        ...(messages ? messages.current : []),
      ].findLast((el) => el.source === 'user');
      return trackCopilotUsage(params[0], {
        ...params[1],
        lastPrompt: latestUserMessage?.content,
        fullScreen: isExpanded,
        project: sdk.project,
        baseUrl: sdk.getBaseUrl(),
      } as any);
    },
    [isExpanded, messages, sdk]
  );
  return {
    track,
  };
};
