import { isAfter } from 'date-fns/esm';

import { Chip } from '@cognite/cogs.js';
import type { SimulatorInstance } from '@cognite/simconfig-api-sdk/rtk';

import { HEARTBEAT_TIMEOUT_SECONDS } from './constants';

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
  const isRunningTask = [
    'RUNNING_CALCULATION',
    'PARSING_MODEL',
    'CHECKING_LICENSE',
  ].includes(simulator.connectorStatus);

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
