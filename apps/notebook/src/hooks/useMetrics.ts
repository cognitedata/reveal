import { useCallback } from 'react';

import mixpanel from 'mixpanel-browser';

import sdk from '@cognite/cdf-sdk-singleton';

mixpanel.init('5c4d853e7c3b77b1eb4468d5329b278c', {}, 'cdf_jupyterlite');
const _mixpanel = mixpanel as unknown as { [key in string]: typeof mixpanel };

type TrackingEvent = {
  CancelCopilotWidget: undefined;
  CancelExplainCode: { code: string; hangSeconds: string };
  CancelGenerateCode: { inputValue: string };
  ChooseExplainCode: undefined;
  ChooseGenerateCode: undefined;
  DisableCopilotPlugin: undefined;
  OpenCopilotWidget: undefined;
  ReceiveExplainCodeResponse: {
    code: string;
    response: string;
    responseSeconds: string;
  };
  ReceiveGenerateCodeResponse: {
    prompt: string;
    response: string;
    responseSeconds: string;
  };
  RequestExplainCode: { code: string };
  RequestGenerateCode: { prompt: string };
};

export type BaseEventData = {
  event: 'JupyterLiteEvent' | 'NotebookCopilotEvent';
  data: {
    eventName: keyof TrackingEvent;
    data: TrackingEvent[keyof TrackingEvent];
  };
};

export const useMetrics = () => {
  const track = useCallback((eventData: BaseEventData) => {
    return trackUsage(
      eventData,
      eventData.data.data,
      sdk.project,
      sdk.getBaseUrl()
    );
  }, []);
  return {
    track,
  };
};

export const trackUsage = <T extends keyof TrackingEvent>(
  eventData: BaseEventData,
  content: TrackingEvent[T],
  project: string,
  baseUrl: string
) => {
  let mixpanelEventKey;
  switch (eventData.event) {
    case 'JupyterLiteEvent':
      mixpanelEventKey = 'Notebook';
      break;
    case 'NotebookCopilotEvent':
      mixpanelEventKey = 'NotebookCopilot';
      break;
    default:
      throw new Error(`Unknown event type: ${eventData.event}`);
  }
  return _mixpanel.cdf_jupyterlite.track(
    `${mixpanelEventKey}.${eventData.data.eventName}`,
    {
      ...content,
      project,
      baseUrl,
    }
  );
};
