import moment from 'moment';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { CogniteClient } from '@cognite/sdk';

import { RequestStatus, StoreState } from '../types';
import { RootState } from '../index';

import { Simulator, SimulatorBackend, SimulatorState } from './types';

export const initialState: SimulatorState = {
  requestStatus: RequestStatus.IDLE,
  initialized: false,
  simulators: [],
};

export const fetchSimulators = createAsyncThunk(
  'simulator/fetchSimulators',
  async (client: CogniteClient) => {
    const response = await client.sequences.retrieveRows({
      externalId: 'simulator-integrations',
    });
    return response.items.map(([simulator, name, heartbeat]) => ({
      simulator: (simulator ?? SimulatorBackend.UNKNOWN) as SimulatorBackend,
      name: (name ?? '(unknown)').toString(),
      heartbeat: moment(heartbeat),
    }));
  }
);

export const simulatorSlice = createSlice({
  name: 'counter',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchSimulators.pending, (state) => ({
        ...state,
        requestStatus: RequestStatus.LOADING,
      }))
      .addCase(fetchSimulators.fulfilled, (state, action) => ({
        ...state,
        requestStatus: RequestStatus.SUCCESS,
        initialized: true,
        simulators: action.payload,
      }))
      .addCase(fetchSimulators.rejected, (state) => ({
        ...state,
        requestStatus: RequestStatus.ERROR,
      }));
  },
});

export const selectIsSimulatorAvailable = (item: Simulator) =>
  moment(item.heartbeat).isAfter(moment().subtract(60, 'seconds'));

export const selectSimulatorInitialized = (state: StoreState) =>
  state.simulator.initialized;

export const selectSimulators = ({ simulator }: StoreState) => {
  const simulators = [...simulator.simulators];
  return (
    simulators.sort((a, b) => (a.heartbeat < b.heartbeat ? 1 : -1)) ?? null
  );
};

export const selectAvailableSimulators = (state: RootState) =>
  state.simulator.simulators.filter(selectIsSimulatorAvailable).length ?? 0;

export default simulatorSlice.reducer;
