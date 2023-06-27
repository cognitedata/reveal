import { CopilotEvents } from './types';

export let cachedListeners: { event: string; listener: (ev: Event) => void }[] =
  [];

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
  const event = `FromCopilot-${type as string}`;
  window.addEventListener(event, listener, false);
  cachedListeners.push({ event: event, listener });
  return () => {
    window.removeEventListener(event, listener);
    cachedListeners = cachedListeners.reduce(
      (prev, el) =>
        el.event === event && el.listener === listener ? prev : prev.concat(el),
      [] as typeof cachedListeners
    );
  };
};

export const addToCopilotEventListener = <
  T extends keyof CopilotEvents['ToCopilot']
>(
  type: T,
  handler: (data: CopilotEvents['ToCopilot'][T]) => void
) => {
  const listener = createToCopilotEventHandler(handler);
  const event = `ToCopilot-${type as string}`;
  window.addEventListener(event, listener, false);
  cachedListeners.push({ event: event, listener });
  return () => {
    window.removeEventListener(event, listener);
    cachedListeners = cachedListeners.reduce(
      (prev, el) =>
        el.event === event && el.listener === listener ? prev : prev.concat(el),
      [] as typeof cachedListeners
    );
  };
};
