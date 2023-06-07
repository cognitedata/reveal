import { CopilotEvents } from './types';

const createGenericCopilotEventHandler = <
  E extends CopilotEvents,
  I extends keyof E,
  T extends keyof E[I]
>(
  handler: (data: E[I][T]) => void
) => {
  const listener = (ev: Event) => {
    if ('detail' in ev) {
      const event = ev as CustomEvent<E[I][T]>;
      handler(event.detail);
    }
  };
  return listener;
};

export const createFromCopilotEventHandler = <
  E extends CopilotEvents,
  T extends keyof E['FromCopilot']
>(
  handler: (data: E['FromCopilot'][T]) => void
) => createGenericCopilotEventHandler<E, 'FromCopilot', T>(handler);

export const createToCopilotEventHandler = <
  E extends CopilotEvents,
  T extends keyof E['ToCopilot']
>(
  handler: (data: E['ToCopilot'][T]) => void
) => createGenericCopilotEventHandler<E, 'ToCopilot', T>(handler);

export const sendFromCopilotEvent = <
  E extends CopilotEvents,
  T extends keyof E['FromCopilot']
>(
  eventToWatch: T & string,
  data: E['FromCopilot'][T]
) => {
  return window.dispatchEvent(
    new CustomEvent(`FromCopilot-${eventToWatch}`, { detail: data })
  );
};

export const sendToCopilotEvent = <
  E extends CopilotEvents,
  T extends keyof E['ToCopilot']
>(
  eventToWatch: T & string,
  data: E['ToCopilot'][T]
) => {
  return window.dispatchEvent(
    new CustomEvent(`ToCopilot-${eventToWatch}`, { detail: data })
  );
};

export const addFromCopilotEventListener = <E extends CopilotEvents>(
  type: keyof E['FromCopilot'],
  listener: EventListenerOrEventListenerObject
) => {
  window.addEventListener(`FromCopilot-${type as string}`, listener, false);
  return () =>
    window.removeEventListener(`FromCopilot-${type as string}`, listener);
};

export const addToCopilotEventListener = <E extends CopilotEvents>(
  type: keyof E['ToCopilot'],
  listener: EventListenerOrEventListenerObject
) => {
  window.addEventListener(`ToCopilot-${type as string}`, listener, false);
  return () =>
    window.removeEventListener(`ToCopilot-${type as string}`, listener);
};
