import { atom } from 'recoil';
import { EventsCollection } from './types';

export const selectedEventsAtom = atom<EventsCollection>({
  key: 'selectedEventsAtom',
  default: [],
});
