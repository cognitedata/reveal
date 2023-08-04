import { useSelector } from 'react-redux';

import { useSimulatorConfig } from '@simint-app/hooks/useSimulatorConfig';
import { selectProject } from '@simint-app/store/simconfigApiProperties/selectors';
import { formatDistanceToNow } from 'date-fns';
import styled from 'styled-components/macro';

import { Collapse, Skeleton } from '@cognite/cogs.js';
import type { SimulatorInstance } from '@cognite/simconfig-api-sdk/rtk';
import { useGetSimulatorDetailsQuery } from '@cognite/simconfig-api-sdk/rtk';

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
    simulatorVersion,
    licenseLastCheckedTime,
    licenseStatus,
  },
}: SimulatorDetailsProps) {
  const project = useSelector(selectProject);

  const selectedSimualtorConfig = useSimulatorConfig({ simulator, project });

  const simulatorType = selectedSimualtorConfig?.key ?? '';

  const { data: simulatorDetails, isFetching: isFetchingSimulatorDetails } =
    useGetSimulatorDetailsQuery(
      {
        project,
        simulatorType,
        connectorName,
      },
      { skip: !connectorName || simulatorType === '' }
    );

  return (
    <SimulatorInformationContainer data-cy="simulator-information-container">
      <SimulatorInformationList
        data-cy="simulator-information-list"
        id="simulator-info-details"
      >
        <dt>Last seen</dt>
        <dd data-cy="last-seen">
          {formatDistanceToNow(new Date(heartbeat), { addSuffix: true })}
        </dd>
        <dt>Data set</dt>
        <dd data-cy="data-set">{dataSetName}</dd>
        <dt>Connector version</dt>
        <dd data-cy="connector-version">{connectorVersion}</dd>
        <dt>Simulator version</dt>
        <dd data-cy="simulator-version">{simulatorVersion}</dd>
        <dt>License</dt>
        <dd data-cy="license-info">
          {licenseStatus}
          {licenseLastCheckedTime
            ? ` (Last check ${formatDistanceToNow(
                new Date(licenseLastCheckedTime),
                {
                  addSuffix: true,
                }
              )})`
            : ''}
        </dd>
      </SimulatorInformationList>

      {isFetchingSimulatorDetails ? <Skeleton.Rectangle /> : null}

      {simulatorDetails ? (
        <Collapse className="simulator-collapse" accordion>
          <Collapse.Panel
            header="Data set details"
            key={`${simulator}-${connectorName}-dataset-details`}
          >
            <SimulatorInformationList data-cy="simulator-information-list-details">
              <dt>Model files</dt>
              <dd data-cy="model-files">{simulatorDetails.models}</dd>
              <dt>Calculation files</dt>
              <dd data-cy="calculation-files">
                {simulatorDetails.calculations}
              </dd>
              <dt>Calculation run events</dt>
              <dd data-cy="calculation-run-events">
                {simulatorDetails.calculationsRuns}
              </dd>
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
