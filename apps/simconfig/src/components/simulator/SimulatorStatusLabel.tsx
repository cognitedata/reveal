import classNames from 'classnames';
import { isAfter } from 'date-fns/esm';

import { Label } from '@cognite/cogs.js';
import type { SimulatorInstance } from '@cognite/simconfig-api-sdk/rtk';

import { HEARTBEAT_TIMEOUT_SECONDS } from 'components/simulator/constants';

interface SimulatorStatusCellProps {
  simulator: SimulatorInstance;
  title?: string;
}

export function SimulatorStatusLabel({
  simulator,
  title,
}: SimulatorStatusCellProps) {
  const isSimulatorAvailable = isAfter(
    new Date(simulator.heartbeat),
    new Date(Date.now() - HEARTBEAT_TIMEOUT_SECONDS)
  );

  if (isSimulatorAvailable) {
    return (
      <Label
        className={classNames({ 'cogs-label--is-interactive': title })}
        icon="CheckmarkAlternative"
        size="small"
        variant="success"
      >
        {title ?? 'Available'}
      </Label>
    );
  }

  return (
    <Label
      className={classNames({ 'cogs-label--is-interactive': title })}
      icon="Warning"
      size="small"
      variant="danger"
    >
      {title ?? 'Unavailable'}
    </Label>
  );
}
