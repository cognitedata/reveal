import { CogniteClient } from '@cognite/sdk';
import { createAsyncThunk } from '@reduxjs/toolkit';

import { Simulator } from './types';
import { SimulatorBackend } from './constants';

const fetchSimulatorInformation = async (
  client: CogniteClient,
  externalId: string
) => {
  const rows = await client.sequences.retrieveRows({ externalId });
  const values = rows.items.map((row) => row[1]);
  const [dataset] = await client.datasets.retrieve([{ id: Number(values[1]) }]);
  return [dataset.name, dataset.writeProtected, ...values];
};

export const fetchSimulators = createAsyncThunk(
  'simulator/fetchSimulators',
  async (client: CogniteClient) => {
    const sequences = await client.sequences.list({
      filter: {
        metadata: {
          dataType: 'Simulator Integration',
        },
      },
    });

    const resolveSimulators: Promise<Simulator>[] = sequences.items.map(
      (simulator) =>
        new Promise((resolve) => {
          if (simulator?.externalId) {
            fetchSimulatorInformation(client, simulator.externalId).then(
              (rows) => {
                resolve({
                  dataSetName: rows[0],
                  dataSetWriteProtected: rows[1],
                  simulator: (simulator.metadata?.simulator ??
                    SimulatorBackend.UNKNOWN) as SimulatorBackend,
                  name: (
                    simulator.metadata?.connector ?? '(unknown)'
                  ).toString(),
                  heartbeat: parseInt((rows[2] || 0).toString(), 10),
                  dataSet: Number(rows[3]),
                  connectorVersion: String(rows[4]).replace('SimConnect-', ''),
                } as Simulator);
              }
            );
          }
        })
    );

    const simulators = await Promise.all(resolveSimulators);
    return simulators;
  }
);
