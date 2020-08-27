import React, { useContext, useEffect, useState } from 'react';
import { Badge, Button } from '@cognite/cogs.js';
import { Checkbox, Select } from 'antd';
import {
  Configuration,
  DummyUser,
  GenericResponseObject,
  Source,
} from 'typings/interfaces';
import { SelectValue } from 'antd/es/select';
import ApiContext from 'contexts/ApiContext';
import { useHistory } from 'react-router-dom';
import {
  ConfigurationArrow,
  ConfigurationContainer,
  ConnectorList,
  Header,
  InitialState,
  ThreeColsLayout,
} from '../elements';

type Props = {
  name: string | undefined | null;
};

enum ConfigUIState {
  INITIAL,
  CONFIGURING,
  CONFIRMED,
}

enum ChangeType {
  REPO,
  PROJECT,
  TAGS,
  DATATYPES,
}

const PetrelStudioToOpenWorks = ({ name }: Props) => {
  const [configuration, setConfiguration] = useState<Configuration>({
    name,
    source: {
      external_id: '',
      source: Source.STUDIO,
    },
    target: {
      external_id: '',
      source: Source.OPENWORKS,
    },
    business_tags: [],
    author: DummyUser.DEMO,
    datatypes: [],
  });
  const [configurationIsComplete, setConfigurationIsComplete] = useState<
    boolean
  >(false);
  const [sourceUIState, setSourceUIState] = useState<ConfigUIState>(
    ConfigUIState.INITIAL
  );
  const [targetUIState, setTargetUIState] = useState<ConfigUIState>(
    ConfigUIState.INITIAL
  );
  const [sourceComplete, setSourceComplete] = useState<boolean>(false);
  const [targetComplete, setTargetComplete] = useState<boolean>(false);
  const [availableRepositories, setAvailableRepositories] = useState<
    GenericResponseObject[]
  >([]);
  const [availableProjects, setAvailableProjects] = useState<
    GenericResponseObject[]
  >([]);
  const [availableDataTypes, setAvailableDataTypes] = useState<
    { label: string; value: string }[]
  >([
    {
      label: 'apple',
      value: 'apple',
    },
  ]);
  const { api } = useContext(ApiContext);
  const history = useHistory();
  const { Option } = Select;

  async function fetchRepositories(): Promise<GenericResponseObject[]> {
    return api!.projects.get(Source.STUDIO);
  }

  async function fetchProjects(): Promise<GenericResponseObject[]> {
    return api!.projects.get(Source.OPENWORKS);
  }

  async function fetchDataTypes(projectId: number): Promise<string[]> {
    return api!.datatypes.get(projectId);
  }

  function getRepositoryIdInArrayFromExternalId(externalId: string) {
    return availableRepositories.find(
      (element) => element.external_id === externalId
    );
  }

  function handleChange(type: ChangeType, value: SelectValue) {
    if (type === ChangeType.REPO) {
      updateSourceRepository(value);
      fetchDataTypes(
        getRepositoryIdInArrayFromExternalId(value.toString())!.id
      ).then((response) => {
        const results: any = [];
        response.map((item) => results.push({ label: item, value: item }));
        setAvailableDataTypes(results);
        updateDataTypes([]);
      });
    } else if (type === ChangeType.PROJECT) {
      updateTargetProject(value);
    } else if (type === ChangeType.TAGS) {
      updateBusinessTags(value);
    } else if (type === ChangeType.DATATYPES) {
      updateDataTypes(value);
    }
  }

  function handleSaveConfigurationClick() {
    api!.configurations.create(configuration).then(() => {
      history.push('/configurations'); // Bug in react-router-dom - does not render after history.push()
    });
  }

  function updateSourceRepository(value: SelectValue) {
    setConfiguration((prevState) => {
      return {
        ...prevState,
        source: { ...prevState.source, external_id: value.toString() },
      };
    });
  }

  function updateTargetProject(value: SelectValue) {
    setConfiguration((prevState) => {
      return {
        ...prevState,
        target: { ...prevState.target, external_id: value.toString() },
      };
    });
  }

  function updateBusinessTags(value: any) {
    setConfiguration((prevState) => {
      return {
        ...prevState,
        business_tags: value,
      };
    });
  }

  function updateDataTypes(value: any) {
    setConfiguration((prevState) => {
      return {
        ...prevState,
        datatypes: value,
      };
    });
  }

  useEffect(() => {
    if (
      configuration.source.external_id.trim() !== '' &&
      configuration.datatypes.length > 0
    ) {
      setSourceComplete(true);
    } else {
      setSourceComplete(false);
    }
    if (configuration.target.external_id.trim() !== '') {
      setTargetComplete(true);
    } else {
      setTargetComplete(false);
    }
  }, [configuration]);

  useEffect(() => {
    if (
      sourceUIState === ConfigUIState.CONFIRMED &&
      targetUIState === ConfigUIState.CONFIRMED &&
      sourceComplete &&
      targetComplete
    ) {
      setConfigurationIsComplete(true);
    } else {
      setConfigurationIsComplete(false);
    }
  }, [sourceComplete, targetComplete, sourceUIState, targetUIState]);

  // noinspection HtmlUnknownTarget
  return (
    <div>
      <Header>
        <b>{name}</b>
        <Button
          type="primary"
          style={{ height: '36px' }}
          disabled={!configurationIsComplete}
          onClick={handleSaveConfigurationClick}
        >
          Save Configuration
        </Button>
      </Header>
      <ThreeColsLayout>
        <ConfigurationContainer>
          <header>
            <b>Petrel Studio</b>
            {sourceUIState === ConfigUIState.CONFIRMED && (
              <>
                <div>{configuration.source.external_id}</div>
                {configuration.business_tags.map((tag) => (
                  <Badge key={tag} text={tag} background="greyscale-grey5" />
                ))}
              </>
            )}
          </header>
          {sourceUIState === ConfigUIState.INITIAL && (
            <main>
              <InitialState>
                <p>No source repository selected</p>
                <Button
                  type="primary"
                  onClick={() => {
                    setSourceUIState(ConfigUIState.CONFIGURING);
                    fetchRepositories().then((response) =>
                      setAvailableRepositories(response)
                    );
                  }}
                >
                  Configure
                </Button>
              </InitialState>
            </main>
          )}
          {sourceUIState === ConfigUIState.CONFIGURING && (
            <>
              <main>
                <div>Select repository:</div>
                <Select
                  defaultValue={undefined}
                  placeholder="Available repositories"
                  style={{ width: '100%', marginBottom: '16px' }}
                  onChange={(value) => handleChange(ChangeType.REPO, value)}
                >
                  {availableRepositories.map((repository) => (
                    <Option
                      key={repository.external_id}
                      value={repository.external_id}
                    >
                      {repository.external_id}
                    </Option>
                  ))}
                </Select>
                {configuration.source.external_id !== '' && (
                  <>
                    <div>Select tags:</div>
                    <Select
                      mode="tags"
                      placeholder="Available tags"
                      style={{ width: '100%', marginBottom: '16px' }}
                      onChange={updateBusinessTags}
                    >
                      <Option value="cwp_valhall">cwp_valhall</Option>
                      <Option value="cwp_alvheim">cwp_alvheim</Option>
                      <Option value="gas">gas</Option>
                      <Option value="oil">oil</Option>
                    </Select>
                    <div>Select Datatypes:</div>
                    <Checkbox.Group
                      options={availableDataTypes}
                      onChange={(value: any) =>
                        handleChange(ChangeType.DATATYPES, value)
                      }
                    />
                  </>
                )}
              </main>
              <footer>
                <Button
                  type="primary"
                  disabled={!sourceComplete}
                  onClick={() => setSourceUIState(ConfigUIState.CONFIRMED)}
                >
                  Confirm
                </Button>
              </footer>
            </>
          )}
          {sourceUIState === ConfigUIState.CONFIRMED && (
            <main>
              <ConnectorList connectorPosition="right">
                {configuration.datatypes.map((datatype) => (
                  <li key={datatype}>{datatype}</li>
                ))}
              </ConnectorList>
            </main>
          )}
        </ConfigurationContainer>
        <ConfigurationArrow>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 300 31"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4"
              d="M2 16.6337h296L283.383 2M2 16.6337h296l-14.617 11.973"
            />
          </svg>
        </ConfigurationArrow>
        <ConfigurationContainer>
          <header>
            <b>OpenWorks</b>
            {targetUIState === ConfigUIState.CONFIRMED && (
              <div>{configuration.target.external_id}</div>
            )}
          </header>
          {targetUIState === ConfigUIState.INITIAL && (
            <main>
              <InitialState>
                <p>No destination project selected</p>
                <Button
                  type="primary"
                  onClick={() => {
                    setTargetUIState(ConfigUIState.CONFIGURING);
                    fetchProjects().then((response) =>
                      setAvailableProjects(response)
                    );
                  }}
                >
                  Configure
                </Button>
              </InitialState>
            </main>
          )}
          {targetUIState === ConfigUIState.CONFIGURING && (
            <>
              <main>
                <div>Select project:</div>
                <Select
                  defaultValue={undefined}
                  placeholder="Available projects"
                  style={{ width: '100%', marginBottom: '16px' }}
                  onChange={(value) => handleChange(ChangeType.PROJECT, value)}
                >
                  {availableProjects.map((project) => (
                    <Option
                      key={project.external_id}
                      value={project.external_id}
                    >
                      {project.external_id}
                    </Option>
                  ))}
                </Select>
              </main>
              <footer>
                <Button
                  type="primary"
                  disabled={!targetComplete}
                  onClick={() => setTargetUIState(ConfigUIState.CONFIRMED)}
                >
                  Confirm
                </Button>
              </footer>
            </>
          )}
          {targetUIState === ConfigUIState.CONFIRMED && (
            <main>
              <ConnectorList connectorPosition="left">
                <li>_Root</li>
              </ConnectorList>
            </main>
          )}
        </ConfigurationContainer>
      </ThreeColsLayout>
    </div>
  );
};

export default PetrelStudioToOpenWorks;
