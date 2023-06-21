import { CopilotEvents } from './types';

const createGenericCopilotEventHandler = <
  I extends keyof CopilotEvents,
  T extends keyof CopilotEvents[I]
>(
  handler: (data: CopilotEvents[I][T]) => void
) => {
  const listener = (ev: Event) => {
    if ('detail' in ev) {
      const event = ev as CustomEvent<CopilotEvents[I][T]>;
      handler(event.detail);
    }
  };
  return listener;
};

export const createFromCopilotEventHandler = <
  T extends keyof CopilotEvents['FromCopilot']
>(
  handler: (data: CopilotEvents['FromCopilot'][T]) => void
) => createGenericCopilotEventHandler<'FromCopilot', T>(handler);

export const createToCopilotEventHandler = <
  T extends keyof CopilotEvents['ToCopilot']
>(
  handler: (data: CopilotEvents['ToCopilot'][T]) => void
) => createGenericCopilotEventHandler<'ToCopilot', T>(handler);

export const sendFromCopilotEvent = <
  T extends keyof CopilotEvents['FromCopilot']
>(
  eventToWatch: T & string,
  data: CopilotEvents['FromCopilot'][T]
) => {
  return window.dispatchEvent(
    new CustomEvent(`FromCopilot-${eventToWatch}`, { detail: data })
  );
};

export const sendToCopilotEvent = <T extends keyof CopilotEvents['ToCopilot']>(
  eventToWatch: T & string,
  data: CopilotEvents['ToCopilot'][T]
) => {
  return window.dispatchEvent(
    new CustomEvent(`ToCopilot-${eventToWatch}`, { detail: data })
  );
};

export const addFromCopilotEventListener = <
  T extends keyof CopilotEvents['FromCopilot']
>(
  type: T,
  handler: (data: CopilotEvents['FromCopilot'][T]) => void
) => {
  const listener = createFromCopilotEventHandler(handler);
  window.addEventListener(`FromCopilot-${type as string}`, listener, false);
  return () =>
    window.removeEventListener(`FromCopilot-${type as string}`, listener);
};

export const addToCopilotEventListener = <
  T extends keyof CopilotEvents['ToCopilot']
>(
  type: T,
  handler: (data: CopilotEvents['ToCopilot'][T]) => void
) => {
  const listener = createToCopilotEventHandler(handler);
  window.addEventListener(`ToCopilot-${type as string}`, listener, false);
  return () =>
    window.removeEventListener(`ToCopilot-${type as string}`, listener);
};
