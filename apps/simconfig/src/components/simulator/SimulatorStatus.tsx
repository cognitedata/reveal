import { useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Icon, Colors } from '@cognite/cogs.js';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { readSimulators } from 'store/simulator/thunks';
import {
  selectSimulators,
  selectAvailableSimulators,
  selectSimulatorInitialized,
} from 'store/simulator/selectors';
import { usePolling } from 'hooks/usePolling';

import { SimulatorTag } from './elements';

const POLLING_INTERVAL = 100000;

export function SimulatorStatus() {
  const dispatch = useDispatch();
  const cdfClient = useContext(CdfClientContext);

  const simulators = useSelector(selectSimulators);
  const simulatorInitialized = useSelector(selectSimulatorInitialized);
  const availableSimulators = useSelector(selectAvailableSimulators);

  usePolling(
    () => {
      dispatch(readSimulators(cdfClient));
    },
    POLLING_INTERVAL,
    true
  );

  if (!simulatorInitialized) {
    return <Icon type="LoadingSpinner" />;
  }

  if (simulators?.length && availableSimulators) {
    return (
      <SimulatorTag
        simulators={simulators}
        color={Colors['graphics-success'].hex()}
        icon="Checkmark"
      >
        {simulators[0].simulator} available
      </SimulatorTag>
    );
  }

  return (
    <SimulatorTag
      simulators={simulators}
      color={Colors['graphics-danger'].hex()}
      icon="WarningTriangle"
    >
      Simulator unavailable
    </SimulatorTag>
  );
}
