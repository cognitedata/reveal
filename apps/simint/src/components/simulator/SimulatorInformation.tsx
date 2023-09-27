import { useSelector } from 'react-redux';

import { useSimulatorConfig } from '@simint-app/hooks/useSimulatorConfig';
import { selectProject } from '@simint-app/store/simconfigApiProperties/selectors';
import { formatDistanceToNow } from 'date-fns';
import styled from 'styled-components/macro';

import { Collapse, Icon, Skeleton } from '@cognite/cogs.js';
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
    connectorStatus = 'NONE_REPORTED',
    connectorStatusUpdatedTime,
  },
}: SimulatorDetailsProps) {
  const project = useSelector(selectProject);

  const selectedSimulatorConfig = useSimulatorConfig({ simulator, project });

  const simulatorType = selectedSimulatorConfig?.key ?? '';

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
        <dt>Connector Status</dt>
        <dd data-cy="connector-status">
          {connectorStatus === 'RUNNING_CALCULATION' ? (
            <div>
              <StyledLoader type="Loader" />
              Running calculation
            </div>
          ) : connectorStatus === 'PARSING_MODEL' ? (
            <div>
              <StyledLoader type="Loader" />
              Parsing model
            </div>
          ) : connectorStatus === 'CHECKING_LICENSE' ? (
            <div>
              <StyledLoader type="Loader" />
              Checking license
            </div>
          ) : connectorStatus === 'NONE_REPORTED' ? (
            <div>-</div>
          ) : (
            <></>
          )}
          {connectorStatus !== 'NONE_REPORTED' &&
            `(Elapsed time: ${formatDistanceToNow(
              new Date(connectorStatusUpdatedTime),
              {
                addSuffix: false,
              }
            )})`}
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

const StyledLoader = styled(Icon)`
  position: relative;
  top: 2px;
  margin-right: 5px;
`;

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
