import { useSelector } from 'react-redux';

import styled from 'styled-components/macro';

import { Label, Skeleton, Tooltip } from '@cognite/cogs.js';
import { useGetSimulatorsListQuery } from '@cognite/simconfig-api-sdk/rtk';

import {
  HEADER_VISIBLE_SIMULATORS_COUNT,
  HEARTBEAT_POLL_INTERVAL,
} from 'components/simulator/constants';
import { selectProject } from 'store/simconfigApiProperties/selectors';

import { SimulatorList } from './SimulatorList';
import { SimulatorStatusLabel } from './SimulatorStatusLabel';

export function SimulatorStatus() {
  const project = useSelector(selectProject);

  const { data: simulatorsList, isLoading: isLoadingSimulatorsList } =
    useGetSimulatorsListQuery(
      { project },
      { pollingInterval: HEARTBEAT_POLL_INTERVAL }
    );

  if (isLoadingSimulatorsList) {
    return <Skeleton.Rectangle width="100px" />;
  }

  if (!simulatorsList?.simulators?.length) {
    return null;
  }

  const simulators = simulatorsList.simulators.slice(
    0,
    HEADER_VISIBLE_SIMULATORS_COUNT
  );
  const simulatorsOverflow = simulatorsList.simulators.slice(
    HEADER_VISIBLE_SIMULATORS_COUNT
  );

  return (
    <SimulatorStatusContainer>
      {simulators.map((simulator) => (
        <div key={simulator.connectorName}>
          <SimulatorTooltip
            content={<SimulatorList simulators={[simulator]} />}
          >
            <SimulatorStatusLabel
              simulator={simulator}
              title={simulator.simulator}
            />
          </SimulatorTooltip>
        </div>
      ))}

      {simulatorsOverflow.length ? (
        <div>
          <SimulatorTooltip
            content={<SimulatorList simulators={simulatorsOverflow} />}
          >
            <Label
              aria-label="Show additional simulators"
              className="cogs-label--is-interactive"
              size="small"
              variant="unknown"
            >
              +
              {simulatorsList.simulators.length -
                HEADER_VISIBLE_SIMULATORS_COUNT}
            </Label>
          </SimulatorTooltip>
        </div>
      ) : null}
    </SimulatorStatusContainer>
  );
}

const SimulatorStatusContainer = styled.div`
  display: flex;
  column-gap: 12px;
  align-items: center;
  & > div > span {
    display: flex;
    align-items: center;
  }
  .cogs-label {
    column-gap: 6px;
  }
`;

const SimulatorTooltip = styled(Tooltip).attrs(() => ({
  placement: 'bottom-end',
  theme: 'cogs-light',
  trigger: 'click',
  interactive: true,
}))`
  .tippy-content {
    padding: 0;
  }
`;
