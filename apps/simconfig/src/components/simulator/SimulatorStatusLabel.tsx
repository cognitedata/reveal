import classNames from 'classnames';
import { isAfter } from 'date-fns/esm';
import styled from 'styled-components/macro';

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

  return (
    <SimulatorStatusLabelContainer>
      <Label
        className={classNames({ 'cogs-label--is-interactive': title })}
        icon={isSimulatorAvailable ? 'CheckmarkAlternative' : 'Warning'}
        size="small"
        variant={isSimulatorAvailable ? 'success' : 'danger'}
      >
        {title ?? 'Unavailable'}
      </Label>
    </SimulatorStatusLabelContainer>
  );
}

const SimulatorStatusLabelContainer = styled.div`
  .cogs-label {
    column-gap: 6px;
  }
`;
