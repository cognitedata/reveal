import { useContext } from 'react';
import { useSelector } from 'react-redux';
import { Icon, Colors } from '@cognite/cogs.js';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { usePolling } from 'hooks/usePolling';
import { fetchSimulators } from 'store/simulator/thunks';
import {
  selectAvailableSimulators,
  selectIsSimulatorInitialized,
  selectSimulators,
} from 'store/simulator/selectors';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { HEARTBEAT_POLL_INTERVAL } from 'store/simulator/constants';

import { SimulatorTag } from './elements';

function SimulatorStatusComponent() {
  const dispatch = useAppDispatch();
  const { cdfClient } = useContext(CdfClientContext);
  const simulators = useAppSelector(selectSimulators);
  const isSimulatorInitialized = useSelector(selectIsSimulatorInitialized);
  const availableSimulators = useSelector(selectAvailableSimulators);

  usePolling(
    () => {
      dispatch(fetchSimulators(cdfClient));
    },
    HEARTBEAT_POLL_INTERVAL * 1000,
    true
  );

  if (!isSimulatorInitialized) {
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

export const SimulatorStatus = SimulatorStatusComponent;
