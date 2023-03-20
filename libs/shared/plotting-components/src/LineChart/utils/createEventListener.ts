import noop from 'lodash/noop';

export const createEventListener = <EventType = Event>(
  element: Document | Element | null | undefined,
  type: string,
  listener: (event: EventType) => void
) => {
  if (!element) {
    return () => noop;
  }

  const eventListener = (event: Event) => {
    listener(event as unknown as EventType);
  };

  element.addEventListener(type, eventListener);
  return () => element.removeEventListener(type, eventListener);
};
