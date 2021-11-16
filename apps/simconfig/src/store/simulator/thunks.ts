import { CogniteClient } from '@cognite/sdk';
import { createAsyncThunk } from '@reduxjs/toolkit';

import { SimulatorBackend } from './constants';

export const fetchSimulators = createAsyncThunk(
  'simulator/fetchSimulators',
  async (client: CogniteClient) => {
    const response = await client.sequences.retrieveRows({
      externalId: 'simulator-integrations',
    });
    return response.items.map(
      ([
        simulator,
        name,
        heartbeat,
        modelLibraryDataSet,
        configurationLibraryDataSet,
        connectorVersion,
      ]) => ({
        simulator: (simulator ?? SimulatorBackend.UNKNOWN) as SimulatorBackend,
        name: (name ?? '(unknown)').toString(),
        heartbeat: parseInt((heartbeat || 0).toString(), 10),
        modelLibraryDataSet: Number(modelLibraryDataSet),
        configurationLibraryDataSet: Number(configurationLibraryDataSet),
        connectorVersion: String(connectorVersion).replace('SimConnect-', ''),
      })
    );
  }
);
