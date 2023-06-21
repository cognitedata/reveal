import { useEffect } from 'react';

import { CopilotEvents } from '../types';
import {
  addFromCopilotEventListener,
  addToCopilotEventListener,
} from '../utils';

export const useFromCopilotEventHandler = <
  T extends keyof CopilotEvents['FromCopilot']
>(
  eventToWatch: T,
  handler: (data: CopilotEvents['FromCopilot'][T]) => void
) => {
  return useEffect(() => {
    const removeListener = addFromCopilotEventListener(eventToWatch, handler);
    return () => removeListener();
  }, [eventToWatch, handler]);
};

export const useToCopilotEventHandler = <
  T extends keyof CopilotEvents['ToCopilot']
>(
  eventToWatch: T,
  handler: (data: CopilotEvents['ToCopilot'][T]) => void
) => {
  return useEffect(() => {
    const removeListener = addToCopilotEventListener(eventToWatch, handler);
    return () => removeListener();
  }, [eventToWatch, handler]);
};
