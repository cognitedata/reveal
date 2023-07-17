import { useCallback } from 'react';

import mixpanel from 'mixpanel-browser';

import { useCopilotContext } from './useCopilotContext';

mixpanel.init('5c4d853e7c3b77b1eb4468d5329b278c', {}, 'cdf_copilot');

type TrackingEvent = {
  FEEDBACK_POSITIVE: { chain?: string; content: string };
  FEEDBACK_NEGATIVE: { chain?: string; content: string };
  USER_PROMPT: undefined;
  // TODO, refactor to CogniteBaseChain
  USE_CHAIN: { chain: string };
  RESIZE: { size: [number, number] };
  NEW_CHAT: undefined;
  VIEW_CHAT: undefined;
  DELETE_CHAT: undefined;
  MODE_CHANGE: { mode: string };
};

export const useMetrics = <T extends keyof TrackingEvent>() => {
  const { messages, isExpanded } = useCopilotContext();

  const track = useCallback(
    (event: T, content: TrackingEvent[T]) => {
      const latestUserMessage = [
        ...(messages ? messages.current : []),
      ].findLast((el) => el.source === 'user');
      return trackUsage(event, {
        ...content,
        lastPrompt: latestUserMessage?.content,
        fullScreen: isExpanded,
      });
    },
    [isExpanded, messages]
  );
  return {
    track,
  };
};

export const trackUsage = (event: string, content: any) => {
  return (
    mixpanel as unknown as { [key in string]: typeof mixpanel }
  ).cdf_copilot.track(`COPILOT_${event}`, content);
};
