import { CogniteClient } from '@cognite/sdk';
import { RootDispatcher } from 'store/types';
import * as Sentry from '@sentry/browser';
import moment from 'moment';

import { SimulatorBackend } from './types';
import * as actions from './actions';

export const readSimulators =
  (client: CogniteClient) => async (dispatch: RootDispatcher) => {
    dispatch(actions.readSimulators());
    try {
      const response = await client.sequences.retrieveRows({
        externalId: 'simulator-integrations',
      });
      const simulators = response.items.map(([simulator, name, heartbeat]) => ({
        simulator: (simulator ?? SimulatorBackend.UNKNOWN) as SimulatorBackend,
        name: (name ?? '(unknown)').toString(),
        heartbeat: moment(heartbeat),
      }));
      dispatch(actions.readSimulatorsSuccess(simulators));
    } catch (e) {
      dispatch(actions.readSimulatorsError());
      Sentry.captureException(e);
    }
  };
