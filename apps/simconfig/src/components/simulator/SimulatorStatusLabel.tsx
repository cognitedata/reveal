import { isAfter } from 'date-fns/esm';

import { Chip } from '@cognite/cogs.js-v9';
import type { SimulatorInstance } from '@cognite/simconfig-api-sdk/rtk';

import { HEARTBEAT_TIMEOUT_SECONDS } from 'components/simulator/constants';

interface SimulatorStatusCellProps {
  simulator: SimulatorInstance;
  title?: string;
  isMain?: boolean | false;
  onMenuBar?: boolean;
}

export function SimulatorStatusLabel({
  simulator,
  title,
  isMain,
  onMenuBar = true,
}: SimulatorStatusCellProps) {
  const isSimulatorAvailable = isAfter(
    new Date(simulator.heartbeat),
    new Date(Date.now() - HEARTBEAT_TIMEOUT_SECONDS)
  );

  const statusDisplayTitle = isSimulatorAvailable ? 'Available' : 'Unavailable';

  return (
    <Chip
      icon={isSimulatorAvailable ? 'CheckmarkAlternative' : 'Warning'}
      label={onMenuBar ? title : statusDisplayTitle}
      size={!isMain ? 'x-small' : undefined}
      type={isSimulatorAvailable ? 'success' : 'danger'}
      hideTooltip
      {...(title && {
        onClick: () => {
          /* the onClick prop only serves to make the chip have an interactive hover state */
        },
      })}
    />
  );
}
