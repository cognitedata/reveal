import { StoreState } from 'store/types';
import { createSelector } from '@reduxjs/toolkit';

import { eventsAdapter } from './constants';

const { selectById, selectAll } = eventsAdapter.getSelectors();

export const selectEventsState = (state: StoreState) => state.event.events;
export const selectEventHistory = (state: StoreState) =>
  state.event.eventHistory;

export const selectEventById = (id: string) => {
  return createSelector(selectEventsState, (state) => selectById(state, id));
};
export const selectAllEvent = () => {
  return createSelector(selectEventsState, (state) => selectAll(state));
};
