/*!
 * Copyright 2021 Cognite AS
 */
import { EventTrigger } from './EventTrigger';

export type EventCollection = { [eventName: string]: EventTrigger<(...args: any[]) => void> };

/**
 * Method for deleting all external events that are associated with current instance of a class.
 */
export function disposeOfAllEventListeners(eventList: EventCollection): void {
  for (const eventType of Object.keys(eventList)) {
    eventList[eventType].unsubscribeAll();
  }
}
