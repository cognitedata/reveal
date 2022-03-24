import { useSelector } from 'react-redux';

import { formatDistanceToNow } from 'date-fns';
import styled from 'styled-components/macro';

import { Collapse, Skeleton } from '@cognite/cogs.js';
import type { SimulatorInstance } from '@cognite/simconfig-api-sdk/rtk';
import { useGetSimulatorDetailsQuery } from '@cognite/simconfig-api-sdk/rtk';

import { selectProject } from 'store/simconfigApiProperties/selectors';
import { isValidSimulator } from 'utils/simulatorUtils';

import { SimulatorInformationList } from './elements';

interface SimulatorDetailsProps {
  simulatorInstance: SimulatorInstance;
}

export function SimulatorInformation({
  simulatorInstance: {
    simulator,
    connectorName = 'unknown',
    heartbeat,
    dataSetName,
    connectorVersion,
  },
}: SimulatorDetailsProps) {
  const project = useSelector(selectProject);
  const simulatorType = isValidSimulator(simulator) ? simulator : 'UNKNOWN';

  const { data: simulatorDetails, isFetching: isFetchingSimulatorDetails } =
    useGetSimulatorDetailsQuery(
      {
        project,
        simulatorType,
        connectorName,
      },
      { skip: !connectorName }
    );

  return (
    <SimulatorInformationContainer>
      <SimulatorInformationList>
        <dt>Last seen</dt>
        <dd>{formatDistanceToNow(new Date(heartbeat), { addSuffix: true })}</dd>
        <dt>Data set</dt>
        <dd>{dataSetName}</dd>
        <dt>Connector version</dt>
        <dd>{connectorVersion}</dd>
      </SimulatorInformationList>

      {isFetchingSimulatorDetails ? <Skeleton.Rectangle /> : null}

      {simulatorDetails ? (
        <Collapse className="simulator-collapse" accordion>
          <Collapse.Panel
            header="Data set details"
            key={`${simulator}-${connectorName}-dataset-details`}
          >
            <SimulatorInformationList>
              <dt>Model files</dt>
              <dd>{simulatorDetails.models}</dd>
              <dt>Calculation files</dt>
              <dd>{simulatorDetails.calculations}</dd>
              <dt>Calculation run events</dt>
              <dd>{simulatorDetails.calculationsRuns}</dd>
            </SimulatorInformationList>
          </Collapse.Panel>
        </Collapse>
      ) : null}
    </SimulatorInformationContainer>
  );
}

export const SimulatorInformationContainer = styled.div`
  .simulator-collapse {
    border: 1px solid var(--cogs-border-default);
    margin-top: 12px;
    .rc-collapse-header {
      border: 0;
      background: var(--cogs-greyscale-grey1);
    }
  }
`;
