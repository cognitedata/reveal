import { atom } from 'recoil';
import { ChartEventResults, EventsCollection } from './types';

/**
 * Selected Events
 * ===================
 * An array of event items to highlight on the result sidebar  view and plotly
 */
export const selectedEventsAtom = atom<EventsCollection>({
  key: 'selectedEventsAtom',
  default: [],
});

/**
 * Event Results
 * ===================
 * CDF event results for all the event filters created in Chart
 */
export const eventResultsAtom = atom<ChartEventResults[]>({
  key: 'eventResultsAtom',
  default: [],
});

/**
 * Active EventFilter ID
 * ====================
 * Selected event filter ID, to show result sidebar
 */
export const activeEventFilterIdAtom = atom<string>({
  key: 'activeEventFilterIdAtom',
  default: '',
});
