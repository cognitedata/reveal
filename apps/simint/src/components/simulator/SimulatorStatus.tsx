import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import styled from 'styled-components/macro';

import { Button, Skeleton, Tooltip } from '@cognite/cogs.js';
import {
  useGetDefinitionsQuery,
  useGetSimulatorsListV2Query,
} from '@cognite/simconfig-api-sdk/rtk';

import { selectProject } from '../../store/simconfigApiProperties/selectors';

import {
  HEADER_VISIBLE_SIMULATORS_COUNT,
  HEARTBEAT_POLL_INTERVAL,
} from './constants';
import { SimulatorList } from './SimulatorList';
import { SimulatorStatusLabel } from './SimulatorStatusLabel';

export function SimulatorStatus() {
  const project = useSelector(selectProject);

  const { data: definitions } = useGetDefinitionsQuery({
    project,
  });

  const simulatorsConfig = useMemo(
    () => definitions?.simulatorsConfig,
    [definitions]
  );

  const { data: simulatorsList, isLoading: isLoadingSimulatorsList } =
    useGetSimulatorsListV2Query(
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
      {simulators.map((simulator, index) => (
        <div
          id={`simulator-status-${index}`}
          // eslint-disable-next-line react/no-array-index-key
          key={`
          ${simulator.connectorName ?? Math.random()}
          -${simulator.dataSetId ?? Math.random()}
          -simulator-status-${index}
          `}
        >
          <SimulatorTooltip
            content={
              <SimulatorList
                // eslint-disable-next-line react/no-array-index-key
                key={`${
                  simulator.connectorName ?? Math.random()
                }-simulator-tooltip-list-${index}`}
                simulators={[simulator]}
              />
            }
          >
            <SimulatorStatusLabel
              simulator={simulator}
              title={
                simulatorsConfig?.filter(
                  ({ key }) => key === simulator.simulator
                )?.[0].name ?? simulator.simulator
              }
              isMain
            />
          </SimulatorTooltip>
        </div>
      ))}

      {simulatorsOverflow.length ? (
        <div>
          <SimulatorTooltip
            content={<SimulatorList simulators={simulatorsOverflow} />}
          >
            <Button
              aria-label="Show additional simulators"
              icon="ChevronDown"
              iconPlacement="right"
            >
              +
              {simulatorsList.simulators.length -
                HEADER_VISIBLE_SIMULATORS_COUNT}
            </Button>
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
`;

const SimulatorTooltip = styled(Tooltip).attrs(() => ({
  placement: 'bottom-end',
  trigger: 'click',
  elevated: true,
  interactive: true,
}))`
  .tippy-content {
    padding: 0 !important;
  }
`;
