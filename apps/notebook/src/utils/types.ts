export type TrackingEvent = {
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
  event: 'NotebookCopilotEvent' | 'NotebookEvent';
  data: {
    eventName: keyof TrackingEvent;
    data: TrackingEvent[keyof TrackingEvent];
  };
};
