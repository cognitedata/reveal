import { useCallback } from 'react';

import mixpanel from 'mixpanel-browser';

import { useSDK } from '@cognite/sdk-provider';

import { useCopilotContext } from './useCopilotContext';

mixpanel.init('5c4d853e7c3b77b1eb4468d5329b278c', {}, 'cdf_copilot');

type TrackingEvent = {
  FEEDBACK_POSITIVE: { chain?: string; content: string; prompt: string };
  FEEDBACK_NEGATIVE: { chain?: string; content: string; prompt: string };
  USER_PROMPT: undefined;
  FAILED: { details: any; message: string; chain: string };
  // TODO, refactor to CogniteBaseChain
  USE_CHAIN: { chain: string };
  RESIZE: { size: [number, number] };
  NEW_CHAT: undefined;
  VIEW_CHAT: undefined;
  DELETE_CHAT: undefined;
  MODE_CHANGE: { mode: string };
  GQL_VIEW_FILTER: { filter: any };
  GQL_EDIT_FILTER: { oldFilter?: any; filter: any };
  TIME_TO_RESULT: {
    seconds: string;
    chain: string;
    prompt: string;
  };
};

export const useMetrics = <T extends keyof TrackingEvent>() => {
  const { messages, isExpanded } = useCopilotContext();
  const sdk = useSDK();

  const track = useCallback(
    (event: T, content: TrackingEvent[T]) => {
      const latestUserMessage = [
        ...(messages ? messages.current : []),
      ].findLast((el) => el.source === 'user');
      return trackUsage(event, {
        ...content,
        lastPrompt: latestUserMessage?.content,
        fullScreen: isExpanded,
        project: sdk.project,
        baseUrl: sdk.getBaseUrl(),
      });
    },
    [isExpanded, messages, sdk]
  );
  return {
    track,
  };
};

export const trackUsage = <T extends keyof TrackingEvent>(
  event: T,
  content: TrackingEvent[T]
) => {
  return (
    mixpanel as unknown as { [key in string]: typeof mixpanel }
  ).cdf_copilot.track(`COPILOT_${event}`, content);
};
