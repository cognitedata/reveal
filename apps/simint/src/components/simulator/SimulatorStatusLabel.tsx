import { HEARTBEAT_TIMEOUT_SECONDS } from '@simint-app/components/simulator/constants';
import { isAfter } from 'date-fns/esm';

import { Chip } from '@cognite/cogs.js';
import type { SimulatorInstance } from '@cognite/simconfig-api-sdk/rtk';

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
  const isLicenseAvailable = simulator.licenseStatus !== 'Not available';
  const isRunningTask = simulator.connectorStatus.includes([
    'RUNNING_CALCULATION',
    'PARSING_MODEL',
    'CHECKING_LICENSE',
  ]);

  const statusDisplayTitle = isSimulatorAvailable
    ? isLicenseAvailable
      ? 'Available'
      : 'License missing'
    : 'Unavailable';

  return (
    <Chip
      icon={
        isSimulatorAvailable && isLicenseAvailable
          ? isRunningTask
            ? 'Loader'
            : 'CheckmarkAlternative'
          : 'Warning'
      }
      label={onMenuBar ? title : statusDisplayTitle}
      size={!isMain ? 'x-small' : undefined}
      type={
        isSimulatorAvailable
          ? isLicenseAvailable
            ? 'success'
            : 'warning'
          : 'danger'
      }
      hideTooltip
      {...(title && {
        onClick: () => {
          /* the onClick prop only serves to make the chip have an interactive hover state */
        },
      })}
    />
  );
}
