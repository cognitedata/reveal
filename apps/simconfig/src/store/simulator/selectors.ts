import moment from 'moment';
import { StoreState } from 'store/types';

import { Simulator } from './types';

export const selectIsSimulatorAvailable = (item: Simulator) =>
  moment(item.heartbeat).isAfter(moment().subtract(60, 'seconds'));

export const selectSimulatorInitialized = (state: StoreState) =>
  state.simulator.initialized;

export const selectSimulators = (state: StoreState) =>
  state.simulator.simulators.sort((a, b) =>
    a.heartbeat < b.heartbeat ? 1 : -1
  ) ?? null;

export const selectAvailableSimulators = (state: StoreState) =>
  state.simulator.simulators.filter(selectIsSimulatorAvailable).length ?? 0;
