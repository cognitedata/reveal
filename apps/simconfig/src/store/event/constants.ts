import { createEntityAdapter } from '@reduxjs/toolkit';
import { RequestStatus } from 'store/types';

import { EventSerializable, EventState } from './types';

export const eventsAdapter = createEntityAdapter<EventSerializable>({
  selectId: (event) => event.calculationId,
});

export const initialState: EventState = {
  requestStatus: RequestStatus.IDLE,
  initialized: false,
  events: eventsAdapter.getInitialState(),
  eventHistory: undefined,
  currentEvent: undefined,
};
