import { useMemo } from 'react';
import { useNavigate } from 'react-location';
import { useSelector } from 'react-redux';

import styled from 'styled-components/macro';

import { createLink } from '@cognite/cdf-utilities';
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

  const { data: simulatorsList } = useGetSimulatorsListV2Query(
    { project },
    {
      pollingInterval: HEARTBEAT_POLL_INTERVAL,
    }
  );

  const navigate = useNavigate();

  if (!simulatorsList) {
    return <Skeleton.Rectangle data-testid="skeleton" width="100px" />;
  }

  const simulators = (simulatorsList.simulators || []).slice(
    0,
    HEADER_VISIBLE_SIMULATORS_COUNT
  );
  const simulatorsOverflow = (simulatorsList.simulators || []).slice(
    HEADER_VISIBLE_SIMULATORS_COUNT
  );

  return (
    <SimulatorStatusContainer>
      <Tooltip
        content={
          simulatorsList.simulators?.length
            ? 'Setup a new simulator connector to expand your integration capabilities.'
            : 'Setup your first simulator connector to get started. With a working connector you can create simulation routines with a compatible simulator.'
        }
        position="bottom"
        maxWidth={200}
      >
        <Button
          icon={simulatorsList.simulators?.length ? 'Add' : undefined}
          type={simulatorsList.simulators?.length ? 'secondary' : 'primary'}
          aria-label="Add connector"
          onClick={() => {
            navigate({
              to: createLink('/extractors'),
            });
          }}
        >
          {simulatorsList.simulators?.length
            ? undefined
            : 'Connect to simulator'}
        </Button>
      </Tooltip>
      {simulators.map((simulator, index) => {
        const simulatorConfig = simulatorsConfig?.find(
          ({ key }) => key === simulator.simulator
        );

        const simulatorName = simulatorConfig?.name ?? simulator.simulator;

        return (
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
                title={simulatorName}
                isMain
              />
            </SimulatorTooltip>
          </div>
        );
      })}

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
              {(simulatorsList.simulators || []).length -
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
