import { FC, useContext } from 'react';
import { Button, Select } from '@cognite/cogs.js';
import ErrorMessage from 'components/Molecules/ErrorMessage';
import { ProjectResponse } from 'types/ApiInterface';
import APIErrorContext from 'contexts/APIErrorContext';
import { ThirdPartySystems } from 'types/globalTypes';

import {
  ChangeType,
  CommonOriginProps,
  ConfigUIState,
  Origin,
} from '../../types';
import {
  ConfigurationContainer,
  ConnectorList,
  ContainerHeading,
  EditButton,
  InitialState,
  Label,
} from '../../elements';

interface Props extends CommonOriginProps {
  targetComplete: boolean;
  availableProjects: ProjectResponse[];
}
export const TargetOrigin: FC<Props> = ({
  targetComplete,
  targetUIState,
  availableProjects,
  configuration,
  onUiStateChange,
  handleChange,
}) => {
  const { error: apiError } = useContext(APIErrorContext);

  const renderInitialState = () => (
    <main className="initial-main">
      <InitialState>
        <p>No destination project selected</p>
        <Button
          type="primary"
          onClick={() => {
            onUiStateChange(Origin.TARGET, ConfigUIState.CONFIGURING);
          }}
        >
          Configure
        </Button>
      </InitialState>
    </main>
  );

  const renderConfiguringState = () => (
    <>
      <main>
        <Label>Select project:</Label>
        <Select
          placeholder="Available projects"
          closeMenuOnSelect
          value={
            configuration.target.external_id.length > 0
              ? {
                  label: configuration.target.external_id,
                  value: configuration.target.external_id,
                }
              : []
          }
          options={availableProjects.map((item) => ({
            label: `${item.instance} - ${item.external_id}`,
            value: item.id.toString(),
          }))}
          onChange={(event: any) => {
            const selectedItem = availableProjects.find(
              (project) => project.id.toString() === event.value
            );
            handleChange(ChangeType.PROJECT, selectedItem || '');
          }}
        />
      </main>
      <footer>
        <Button
          type="primary"
          disabled={!targetComplete}
          onClick={() =>
            onUiStateChange(Origin.TARGET, ConfigUIState.CONFIRMED)
          }
        >
          Confirm
        </Button>
      </footer>
    </>
  );

  const renderConfirmedState = () => (
    <main>
      <ConnectorList connectorPosition="left" connected>
        <li>
          _Root
          <div id="connectorTarget" className="connectorTarget" />
        </li>
      </ConnectorList>
    </main>
  );

  const renderConfirmedHeaderState = () => (
    <>
      <div>{configuration.target.external_id}</div>
      <EditButton
        type="primary"
        onClick={() =>
          onUiStateChange(Origin.TARGET, ConfigUIState.CONFIGURING)
        }
      >
        Edit
      </EditButton>
    </>
  );

  return (
    <ConfigurationContainer>
      <header>
        <ContainerHeading>{ThirdPartySystems.OW}</ContainerHeading>
        {targetUIState === ConfigUIState.CONFIRMED &&
          renderConfirmedHeaderState()}
      </header>
      {targetUIState === ConfigUIState.INITIAL && renderInitialState()}
      {targetUIState === ConfigUIState.CONFIGURING && renderConfiguringState()}
      {targetUIState === ConfigUIState.CONFIRMED && renderConfirmedState()}
      {apiError && (
        <main>
          <ErrorMessage
            message={`${apiError?.message} available projects` || ''}
          />
        </main>
      )}
    </ConfigurationContainer>
  );
};
