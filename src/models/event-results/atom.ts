import { atom } from 'recoil';
import { ChartEventResults, EventsCollection } from './types';

export const selectedEventsAtom = atom<EventsCollection>({
  key: 'selectedEventsAtom',
  default: [],
});

export const eventResultsAtom = atom<ChartEventResults[]>({
  key: 'eventResultsAtom',
  default: [],
});
