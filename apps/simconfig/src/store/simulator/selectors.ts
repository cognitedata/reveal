import moment from 'moment';

import type { StoreState } from 'store/types';

import { HEARTBEAT_TIMEOUT_SECONDS } from './constants';
import type { Simulator } from './types';

import type { RootState } from 'store';

export const selectIsSimulatorAvailable = (item: Simulator) =>
  moment(item.heartbeat).isAfter(
    moment().subtract(HEARTBEAT_TIMEOUT_SECONDS, 'seconds')
  );

export const selectIsSimulatorInitialized = (state: StoreState) =>
  state.simulator.initialized;

export const selectSimulators = (state: StoreState) =>
  [...state.simulator.simulators].sort((a, b) =>
    a.heartbeat < b.heartbeat ? 1 : -1
  );

export const selectAvailableSimulators = (state: RootState) =>
  state.simulator.simulators.filter(selectIsSimulatorAvailable).length;
