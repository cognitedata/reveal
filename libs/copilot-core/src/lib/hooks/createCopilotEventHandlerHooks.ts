import { useCallback, useEffect } from 'react';

import { CopilotEvents } from '../types';
import {
  createFromCopilotEventHandler,
  addFromCopilotEventListener,
  createToCopilotEventHandler,
  addToCopilotEventListener,
} from '../utils';

export const createCopilotEventHandlerHooks = <E extends CopilotEvents>() => ({
  useFromCopilotEventHandler: <T extends keyof E['FromCopilot']>(
    eventToWatch: T,
    handler: (data: E['FromCopilot'][T]) => void
  ) => {
    const listener = useCallback(
      (ev: Event) => createFromCopilotEventHandler<E, T>(handler)(ev),
      [handler]
    );
    return useEffect(() => {
      const removeListener = addFromCopilotEventListener<E>(
        eventToWatch,
        listener
      );
      return () => removeListener();
    }, [eventToWatch, listener]);
  },
  useToCopilotEventHandler: <T extends keyof E['ToCopilot']>(
    eventToWatch: T,
    handler: (data: E['ToCopilot'][T]) => void
  ) => {
    const listener = useCallback(
      (ev: Event) => createToCopilotEventHandler<E, T>(handler)(ev),
      [handler]
    );
    return useEffect(() => {
      const removeListener = addToCopilotEventListener<E>(
        eventToWatch,
        listener
      );
      return () => removeListener();
    }, [eventToWatch, listener]);
  },
});
