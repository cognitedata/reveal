/**
 * Event result selector
 */

import { selector } from 'recoil';
import { eventResultsAtom, activeEventFilterIdAtom } from './atom';
import { ChartEventResults } from './types';

/**
 * Active EventFilter Results
 * ====================
 * Derived results to show on the sidebar for active event filter
 */
export const activeEventFilterResultsSelector = selector({
  key: 'activeEventFilterResultsSelector',
  get: ({ get }) => {
    const eventData = get(eventResultsAtom);
    const activeEventId = get(activeEventFilterIdAtom);

    const selectedEvent = eventData.find(
      (e: ChartEventResults) => e.id === activeEventId
    );

    return selectedEvent;
  },
});
