import moment from 'moment';
import { RootState } from 'store';
import { StoreState } from 'store/types';

import { HEARTBEAT_TIMEOUT_SECONDS } from './constants';
import { Simulator } from './types';

export const selectIsSimulatorAvailable = (item: Simulator) =>
  moment(item.heartbeat).isAfter(
    moment().subtract(HEARTBEAT_TIMEOUT_SECONDS, 'seconds')
  );

export const selectIsSimulatorInitialized = (state: StoreState) =>
  state.simulator.initialized;

export const selectSimulators = ({ simulator }: StoreState) => {
  const simulators = [...simulator.simulators];
  return (
    simulators.sort((a, b) => (a.heartbeat < b.heartbeat ? 1 : -1)) ?? null
  );
};

export const selectAvailableSimulators = (state: RootState) =>
  state.simulator.simulators.filter(selectIsSimulatorAvailable).length ?? 0;
