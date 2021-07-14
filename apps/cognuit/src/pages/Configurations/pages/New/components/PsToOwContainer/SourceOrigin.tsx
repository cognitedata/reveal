import { FC, useContext } from 'react';
import { Badge, Button, Select } from '@cognite/cogs.js';
import ErrorMessage from 'components/Molecules/ErrorMessage';
import {
  DataStatusResponse,
  ProjectBusinessTagsResponse,
  ProjectsResponse,
} from 'types/ApiInterface';
import APIErrorContext from 'contexts/APIErrorContext';
import { ThirdPartySystems } from 'types/globalTypes';

import {
  ChangeType,
  CommonOriginProps,
  ConfigUIState,
  Origin,
} from '../../types';
import {
  BadgesContainer,
  ConfigurationContainer,
  ConnectorList,
  ContainerHeading,
  EditButton,
  Checkbox,
  InitialState,
  Label,
} from '../../elements';

interface Props extends CommonOriginProps {
  sourceComplete: boolean;
  sourceUIState: ConfigUIState;
  availableRepositories: ProjectsResponse[];
  availableBusinessTags: ProjectBusinessTagsResponse;
  availableDataTypes: string[];
  availableDataStatus: DataStatusResponse[];
}
export const SourceOrigin: FC<Props> = ({
  configuration,
  availableRepositories,
  availableBusinessTags,
  availableDataTypes,
  availableDataStatus,
  sourceComplete,
  sourceUIState,
  targetUIState,
  onUiStateChange,
  handleChange,
}) => {
  const { error: apiError } = useContext(APIErrorContext);

  const renderInitialState = () => (
    <main className="initial-main">
      <InitialState>
        <p>No source repository selected</p>
        <Button
          type="primary"
          onClick={() => {
            onUiStateChange(Origin.SOURCE, ConfigUIState.CONFIGURING);
          }}
        >
          Configure
        </Button>
      </InitialState>
    </main>
  );

  const renderConfiguringState = () => {
    const renderOptions = () => (
      <>
        <Label>Select business tags:</Label>
        <Select
          isMulti
          placeholder="Available business tags"
          closeMenuOnSelect
          theme="filled"
          value={configuration.business_tags.map((item) => ({
            label: item,
            value: item,
          }))}
          options={availableBusinessTags.map((item) => ({
            label: item,
            value: item,
          }))}
          onChange={(event: { value: string }[] | null) => {
            const value = (event || []).map((item) => item.value);
            handleChange(ChangeType.TAGS, value);
          }}
        />

        <Label>Select quality tags:</Label>
        <Select
          isMulti
          placeholder="Available quality tags"
          closeMenuOnSelect
          theme="filled"
          value={configuration.data_status.map((item) => ({
            label: item,
            value: item,
          }))}
          options={availableDataStatus.map((item) => ({
            label: item,
            value: item,
          }))}
          onChange={(event: { value: string }[] | null) => {
            const value = (event || []).map((item) => item.value);
            handleChange(ChangeType.DATASTATUS, value);
          }}
        />

        <Label>Select Datatypes:</Label>
        {availableDataTypes.map((datatype) => (
          <Checkbox
            key={datatype}
            name={datatype}
            checked={configuration.datatypes.includes(datatype)}
            onChange={(nextState: boolean) => {
              let value = configuration.datatypes;
              if (nextState) {
                value = [...value, datatype];
              } else {
                value = value.filter((item) => item !== datatype);
              }
              handleChange(ChangeType.DATATYPES, value);
            }}
          >
            {datatype}
          </Checkbox>
        ))}
      </>
    );

    const areTagsAvailable =
      configuration.source.external_id !== '' &&
      availableBusinessTags.length > 0;

    return (
      <>
        <main>
          <Label>Select repository:</Label>
          <Select
            placeholder="Available repositories"
            closeMenuOnSelect
            theme="filled"
            value={
              configuration.source.external_id.length > 0
                ? {
                    label: configuration.source.external_id,
                    value: configuration.source.external_id,
                  }
                : []
            }
            options={availableRepositories.map((item) => ({
              label: item.external_id,
              value: item.external_id,
            }))}
            onChange={(event: any) => {
              handleChange(ChangeType.REPO, event.value);
            }}
          />

          {areTagsAvailable && renderOptions()}
        </main>
        <footer>
          <Button
            type="primary"
            disabled={!sourceComplete}
            onClick={() =>
              onUiStateChange(Origin.SOURCE, ConfigUIState.CONFIRMED)
            }
          >
            Confirm
          </Button>
        </footer>
      </>
    );
  };

  const renderConfirmedState = () => (
    <main>
      <ConnectorList
        connectorPosition="right"
        connected={targetUIState === ConfigUIState.CONFIRMED}
      >
        {configuration.datatypes.map((datatype, index) => (
          <li key={`datatypeItem${datatype}`}>
            {datatype}
            <div
              key={`connectorPoint${datatype}`}
              id={`connectorPoint${index}`}
              className={`connectorPoint connectorPoint${index}`}
            />
          </li>
        ))}
      </ConnectorList>
    </main>
  );

  const renderConfirmedHeaderState = () => (
    <>
      <div>{configuration.source.external_id}</div>
      <BadgesContainer>
        {configuration.business_tags?.map((tag) => (
          <Badge key={tag} text={tag} background="greyscale-grey3" />
        ))}
      </BadgesContainer>
      <EditButton
        type="primary"
        onClick={() =>
          onUiStateChange(Origin.SOURCE, ConfigUIState.CONFIGURING)
        }
      >
        Edit
      </EditButton>
    </>
  );

  return (
    <ConfigurationContainer>
      <header>
        <ContainerHeading>{ThirdPartySystems.PS}</ContainerHeading>
        {sourceUIState === ConfigUIState.CONFIRMED &&
          renderConfirmedHeaderState()}
      </header>
      {sourceUIState === ConfigUIState.INITIAL && renderInitialState()}
      {sourceUIState === ConfigUIState.CONFIGURING && renderConfiguringState()}
      {sourceUIState === ConfigUIState.CONFIRMED && renderConfirmedState()}
      {apiError && (
        <main>
          <ErrorMessage
            message={`${apiError?.message} available repositories` || ''}
          />
        </main>
      )}
    </ConfigurationContainer>
  );
};
