import classNames from 'classnames';
import { isAfter } from 'date-fns/esm';
import styled from 'styled-components/macro';

import { Label } from '@cognite/cogs.js';
import type { SimulatorInstance } from '@cognite/simconfig-api-sdk/rtk';

import { HEARTBEAT_TIMEOUT_SECONDS } from 'components/simulator/constants';

interface SimulatorStatusCellProps {
  simulator: SimulatorInstance;
  title?: string;
  onMenuBar?: boolean;
}

export function SimulatorStatusLabel({
  simulator,
  title,
  onMenuBar = true,
}: SimulatorStatusCellProps) {
  const isSimulatorAvailable = isAfter(
    new Date(simulator.heartbeat),
    new Date(Date.now() - HEARTBEAT_TIMEOUT_SECONDS)
  );

  const statusDisplayTitle = isSimulatorAvailable ? 'Available' : 'Unavailable';

  return (
    <SimulatorStatusLabelContainer>
      <Label
        className={classNames({ 'cogs-label--is-interactive': title })}
        icon={isSimulatorAvailable ? 'CheckmarkAlternative' : 'Warning'}
        size="small"
        variant={isSimulatorAvailable ? 'success' : 'danger'}
      >
        {onMenuBar ? title : statusDisplayTitle}
      </Label>
    </SimulatorStatusLabelContainer>
  );
}

const SimulatorStatusLabelContainer = styled.div`
  .cogs-label {
    column-gap: 6px;
  }
`;
