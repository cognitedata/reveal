import { useContext } from 'react';
import { useSelector } from 'react-redux';

import { Colors, Icon } from '@cognite/cogs.js';

import { usePolling } from 'hooks/usePolling';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { HEARTBEAT_POLL_INTERVAL } from 'store/simulator/constants';
import {
  selectAvailableSimulators,
  selectIsSimulatorInitialized,
  selectSimulators,
} from 'store/simulator/selectors';
import { fetchSimulators } from 'store/simulator/thunks';

import { SimulatorTag } from './elements';

interface Color {
  hex: () => string;
}

function SimulatorStatusComponent() {
  const dispatch = useAppDispatch();
  const { cdfClient } = useContext(CdfClientContext);
  const simulators = useAppSelector(selectSimulators);
  const isSimulatorInitialized = useSelector(selectIsSimulatorInitialized);
  const availableSimulators = useSelector(selectAvailableSimulators);

  usePolling(
    () => {
      void dispatch(fetchSimulators(cdfClient));
    },
    HEARTBEAT_POLL_INTERVAL * 1000,
    true
  );

  if (!isSimulatorInitialized) {
    return <Icon type="Loader" />;
  }

  if (simulators.length && availableSimulators) {
    return (
      <SimulatorTag
        color={(Colors['graphics-success'] as Color).hex()}
        icon="Checkmark"
        simulators={simulators}
      >
        {simulators[0].simulator} available
      </SimulatorTag>
    );
  }

  return (
    <SimulatorTag
      color={(Colors['graphics-danger'] as Color).hex()}
      icon="WarningTriangle"
      simulators={simulators}
    >
      Simulator unavailable
    </SimulatorTag>
  );
}

export const SimulatorStatus = SimulatorStatusComponent;
