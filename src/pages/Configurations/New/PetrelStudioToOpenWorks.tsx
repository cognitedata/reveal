import React, { useContext, useEffect, useState } from 'react';
import { Badge, Button } from '@cognite/cogs.js';
import { Checkbox, notification, Select } from 'antd';
import {
  Configuration,
  GenericResponseObject,
  Source,
} from 'typings/interfaces';
import { SelectValue } from 'antd/es/select';
import ApiContext from 'contexts/ApiContext';
import AuthContext from 'contexts/AuthContext';
import APIErrorContext from 'contexts/APIErrorContext';
import { useHistory } from 'react-router-dom';
import ErrorMessage from 'components/Molecules/ErrorMessage';

import {
  ConfigurationArrow,
  ConfigurationContainer,
  ConfigurationsMainContainer,
  ConnectionLinesWrapper,
  ConnectorList,
  Header,
  InitialState,
  ThreeColsLayout,
} from '../elements';
import { makeConnectorLines } from './utils';

type Props = {
  name: string | undefined | null;
};

enum ConfigUIState {
  INITIAL,
  CONFIGURING,
  CONFIRMED,
  ERROR,
}

enum ChangeType {
  REPO,
  PROJECT,
  TAGS,
  DATATYPES,
}

const PetrelStudioToOpenWorks = ({ name }: Props) => {
  const { user } = useContext(AuthContext);
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
    author: String(user),
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
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const { api } = useContext(ApiContext);
  const { error: apiError, addError } = useContext(APIErrorContext);
  const history = useHistory();
  const { Option } = Select;

  useEffect(() => {
    setConfiguration((prevState) => {
      return {
        ...prevState,
        author: String(user),
      };
    });
  }, [user]);

  async function fetchRepositories(): Promise<GenericResponseObject[]> {
    return api!.projects.get(Source.STUDIO);
  }

  async function fetchProjects(): Promise<GenericResponseObject[]> {
    return api!.projects.get(Source.OPENWORKS);
  }

  async function fetchDataTypes(projectId: number): Promise<string[]> {
    return api!.datatypes.get(projectId);
  }

  async function fetchBusinessTags(
    repository: string = configuration.source.external_id
  ): Promise<string[]> {
    return api!.projects.getBusinessTags(
      configuration.source.source,
      repository
    );
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
    api!.configurations.create(configuration).then((response) => {
      if (Array.isArray(response) && response.length > 0 && response[0].error) {
        addError(
          `Failed to save configuration - ${response[0].statusText}`,
          response[0].status
        );
      } else {
        notification.success({
          message: 'Configuration created',
          description: 'Configuration was created successfully',
        });
        history.push('/configurations'); // Bug in react-router-dom - does not render after history.push()
      }
    });
  }

  function updateSourceRepository(value: SelectValue) {
    setConfiguration((prevState) => {
      return {
        ...prevState,
        source: { ...prevState.source, external_id: value.toString() },
        business_tags: [],
        datatypes: [],
      };
    });
    fetchBusinessTags(value.toString()).then((response) =>
      setAvailableTags(response)
    );
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

  useEffect(() => {
    if (configurationIsComplete) {
      makeConnectorLines();
    }
  }, [configurationIsComplete]);

  // noinspection HtmlUnknownTarget
  return (
    <>
      <ConfigurationsMainContainer>
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
                      fetchRepositories().then((response) => {
                        if (!response[0].error) {
                          setSourceUIState(ConfigUIState.CONFIGURING);
                          setAvailableRepositories(response);
                        } else {
                          setSourceUIState(ConfigUIState.ERROR);
                          addError('Failed to fetch', response[0].status);
                        }
                      });
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
                  {configuration.source.external_id !== '' &&
                    availableTags.length > 0 && (
                      <>
                        <div>Select tags:</div>
                        <Select
                          mode="tags"
                          placeholder="Available tags"
                          style={{ width: '100%', marginBottom: '16px' }}
                          onChange={updateBusinessTags}
                        >
                          {availableTags.map((tag) => (
                            <Option key={`tag_${tag}`} value={tag}>
                              {tag}
                            </Option>
                          ))}
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
            )}
            {sourceUIState === ConfigUIState.ERROR && (
              <main>
                <ErrorMessage
                  message={`${apiError?.message} available repositories` || ''}
                />
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
                      fetchProjects().then((response) => {
                        if (!response[0].error) {
                          setTargetUIState(ConfigUIState.CONFIGURING);
                          setAvailableProjects(response);
                        } else {
                          setTargetUIState(ConfigUIState.ERROR);
                          addError('Failed to fetch', response[0].status);
                        }
                      });
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
                    onChange={(value) =>
                      handleChange(ChangeType.PROJECT, value)
                    }
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
                <ConnectorList connectorPosition="left" connected>
                  <li>
                    _Root
                    <div id="connectorTarget" className="connectorTarget" />
                  </li>
                </ConnectorList>
              </main>
            )}
            {targetUIState === ConfigUIState.ERROR && (
              <main>
                <ErrorMessage
                  message={`${apiError?.message} available projects` || ''}
                />
              </main>
            )}
          </ConfigurationContainer>
        </ThreeColsLayout>
      </ConfigurationsMainContainer>
      {targetUIState === ConfigUIState.CONFIRMED && (
        <ConnectionLinesWrapper>
          <svg id="connectorLinesSvg">
            {configuration.datatypes.map((datatype, index) => (
              <path
                key={`connectorLine${datatype}`}
                id={`connectorLine${index}`}
                className={`connectorLine connectorLine${datatype}`}
                d="M0 0"
                fill="transparent"
              />
            ))}
          </svg>
        </ConnectionLinesWrapper>
      )}
    </>
  );
};

export default PetrelStudioToOpenWorks;
