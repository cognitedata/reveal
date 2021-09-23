import { useContext } from 'react';
import { useSelector } from 'react-redux';
import { Icon, Colors } from '@cognite/cogs.js';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { usePolling } from 'hooks/usePolling';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  selectAvailableSimulators,
  selectSimulatorInitialized,
  selectSimulators,
  fetchSimulators,
} from '../../store/simulator/simulatorSlice';

import { SimulatorTag } from './elements';

const POLLING_INTERVAL = 100000;

export function SimulatorStatus() {
  const dispatch = useAppDispatch();
  const cdfClient = useContext(CdfClientContext);

  const simulators = useAppSelector(selectSimulators);
  const simulatorInitialized = useSelector(selectSimulatorInitialized);
  const availableSimulators = useSelector(selectAvailableSimulators);

  usePolling(
    () => {
      dispatch(fetchSimulators(cdfClient));
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
