import React, { useContext, useEffect, useState } from 'react';
import { Button, Colors, Icon, Modal, Tooltip } from '@cognite/cogs.js';
import { AuthProvider, AuthContext } from '@cognite/react-container';
import { Checkbox, notification, Select } from 'antd';
import {
  ConfigurationOWtoPS,
  DataTransferObject,
  GenericResponseObject,
  Source,
} from 'typings/interfaces';
import { SelectValue } from 'antd/es/select';
import ApiContext from 'contexts/ApiContext';
import APIErrorContext from 'contexts/APIErrorContext';
import { Link, useHistory } from 'react-router-dom';
import ErrorMessage from 'components/Molecules/ErrorMessage';

import {
  BorderedBottomContainer,
  CenteredLoader,
  ConfigurationContainer,
  ConfigurationsMainContainer,
  ConnectionLinesWrapper,
  ConnectorList,
  ContainerHeading,
  EditButton,
  ErrorModal,
  Header,
  InitialState,
  SaveButton,
  ThreeColsLayout,
} from '../elements';
import { makeConnectorLines } from './utils';
import DatatypeSection from '../DatatypeSection/DatatypeSection';
import LoadingBox from '../../../components/Molecules/LoadingBox';
import ConfigArrow from './ConfigArrow';
import { CloseIcon } from '../../../components/Organisms/DetailView/elements';

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
  WPS,
  TARGETS,
  DESTINATION_FOLDER,
}

const WELL_PLAN_SCENARIOS = 'Well Plan Scenarios';
const ROOT_FOLDER = null;

const OpenWorksToPetrelStudio = ({ name }: Props) => {
  const { authState } = useContext<AuthContext>(AuthProvider);
  const user = authState?.username;

  const [configuration, setConfiguration] = useState<ConfigurationOWtoPS>({
    name,
    source: {
      external_id: '',
      source: Source.OPENWORKS,
    },
    target: {
      external_id: '',
      source: Source.STUDIO,
    },
    author: String(user),
    well_plan: [],
    targets: [],
    ow_to_studio_config: {
      session_name: null,
      tag_name: name,
      folder: null,
    },
  });
  const [
    configurationIsComplete,
    setConfigurationIsComplete,
  ] = useState<boolean>(false);
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
  const [availableTargets, setAvailableTargets] = useState<
    DataTransferObject[]
  >([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [availableWPS] = useState<DataTransferObject[]>([]);
  const [dataTypesLoading, setDataTypesLoading] = useState<boolean>(false);
  const [foldersLoading, setFoldersLoading] = useState<boolean>(false);
  const [
    availableDestinationFolders,
    setAvailableDestinationFolders,
  ] = useState<DataTransferObject[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [creationError, setCreationError] = useState<string | null>(null);
  const { api } = useContext(ApiContext);
  const { error: apiError, addError } = useContext(APIErrorContext);
  const history = useHistory();
  const { Option } = Select;

  useEffect(() => {
    setConfiguration((prevState) => ({
      ...prevState,
      author: String(user),
    }));
  }, [user]);

  async function fetchRepositories(): Promise<GenericResponseObject[]> {
    return api!.projects.get(Source.STUDIO);
  }

  async function fetchProjects(): Promise<GenericResponseObject[]> {
    return api!.projects.get(Source.OPENWORKS);
  }

  async function fetchTargetObjects(
    projectName: string
  ): Promise<GenericResponseObject[]> {
    return api!.objects.getFiltered({
      connector: 'Openworks',
      datatype: 'Target',
      project: projectName,
    });
  }

  async function fetchRepoTree(repo: string): Promise<GenericResponseObject[]> {
    return api!.sources.getRepositoryTree(Source.STUDIO, repo);
  }

  function handleChange(type: ChangeType, value: SelectValue) {
    if (type === ChangeType.PROJECT) {
      setDataTypesLoading(true);
      updateSourceProject(value);
      fetchTargetObjects(value.toString()).then((response) => {
        if (response && Array.isArray(response)) {
          if (response.length > 0 && response[0].error) {
            setSourceUIState(ConfigUIState.ERROR);
            addError('Failed to fetch', response[0].status);
            setDataTypesLoading(false);
          } else {
            setSourceUIState(ConfigUIState.CONFIGURING);
            // setAvailableWPS(response); // Change this to fetch Well Plan Scenarios
            setAvailableTargets(response);
            const targetsObjects = response.map((item) => item.id);
            setConfiguration((prevState) => ({
              ...prevState,
              targets: targetsObjects,
            }));
            setDataTypesLoading(false);
          }
        }
      });
    } else if (type === ChangeType.REPO) {
      updateTargetRepository(value);
      setFoldersLoading(false);
      updateDestinationFolder(ROOT_FOLDER);
      fetchRepoTree(String(value)).then((response) => {
        if (response.length > 0) {
          if (!response[0].error) {
            setAvailableDestinationFolders(response);
          } else {
            setTargetUIState(ConfigUIState.ERROR);
            addError('Failed to fetch', response[0].status);
          }
        } else {
          setAvailableDestinationFolders([]);
        }
        setFoldersLoading(false);
      });
    } else if (type === ChangeType.DESTINATION_FOLDER) {
      updateDestinationFolder(value);
    }
  }

  function handleDatatypeChange(type: ChangeType, value: number[]) {
    if (type === ChangeType.WPS) {
      updateWPS(value);
    } else if (type === ChangeType.TARGETS) {
      updateTargets(value);
    }
  }

  function handleSaveConfigurationClick() {
    setIsSaving(true);
    api!.configurations.create(configuration).then((response) => {
      if (Array.isArray(response) && response.length > 0 && response[0].error) {
        setIsSaving(false);
        addError(
          `Failed to save configuration - ${response[0].statusText}`,
          response[0].status
        );
        setCreationError(
          `Server status: - ${response[0].status}: ${response[0].statusText}`
        );
      } else {
        setIsSaving(false);
        notification.success({
          message: 'Configuration created',
          description: 'Configuration was created successfully',
        });
        history.push('/configurations'); // Bug in react-router-dom - does not render after history.push()
      }
    });
  }

  function updateSourceProject(value: SelectValue) {
    setConfiguration((prevState) => ({
      ...prevState,
      source: { ...prevState.source, external_id: value.toString() },
      well_plan: [],
      targets: [],
    }));
  }

  function updateTargetRepository(value: SelectValue) {
    setConfiguration((prevState) => ({
      ...prevState,
      target: { ...prevState.target, external_id: value.toString() },
    }));
  }

  function updateDestinationFolder(value: SelectValue | null) {
    setConfiguration((prevState) => ({
      ...prevState,
      ow_to_studio_config: {
        ...prevState.ow_to_studio_config,
        folder: value ? value.toString() : null,
      },
    }));
  }

  function updateWPS(value: any) {
    setConfiguration((prevState) => ({
      ...prevState,
      well_plan: value,
    }));
  }

  function updateTargets(value: any) {
    setConfiguration((prevState) => ({
      ...prevState,
      targets: value,
    }));
  }

  useEffect(() => {
    if (
      configuration.source.external_id.trim() !== '' &&
      (configuration.well_plan.length > 0 || configuration.targets.length > 0)
    ) {
      setSourceComplete(true);
    } else {
      setSourceComplete(false);
    }
    if (
      configuration.target.external_id.trim() !== '' &&
      configuration.ow_to_studio_config.folder
    ) {
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
          <SaveButton
            type="primary"
            disabled={!configurationIsComplete}
            onClick={handleSaveConfigurationClick}
            className={configurationIsComplete ? 'enabled' : ''}
            loading={isSaving}
          >
            {isSaving ? 'Saving configuration...' : 'Save Configuration'}
          </SaveButton>
        </Header>
        <ThreeColsLayout>
          <ConfigurationContainer>
            <header>
              <ContainerHeading>OpenWorks</ContainerHeading>
              {sourceUIState === ConfigUIState.CONFIRMED && (
                <>
                  <div>{configuration.source.external_id}</div>
                  <EditButton
                    type="primary"
                    onClick={() => setSourceUIState(ConfigUIState.CONFIGURING)}
                  >
                    Edit
                  </EditButton>
                </>
              )}
            </header>
            {sourceUIState === ConfigUIState.INITIAL && (
              <main className="initial-main">
                <InitialState>
                  <p>No source project selected</p>
                  <Button
                    type="primary"
                    onClick={() => {
                      fetchProjects().then((response) => {
                        if (!response[0].error) {
                          setSourceUIState(ConfigUIState.CONFIGURING);
                          setAvailableProjects(response);
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
                  <div>Select project:</div>
                  <Select
                    value={
                      configuration.source.external_id.length > 0
                        ? configuration.source.external_id
                        : undefined
                    }
                    placeholder="Available OpenWorks projects"
                    style={{ width: '100%', marginBottom: '16px' }}
                    onChange={(value) =>
                      handleChange(ChangeType.PROJECT, value)
                    }
                    suffixIcon={<Icon type="Down" />}
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
                  {configuration.source.external_id !== '' && (
                    <BorderedBottomContainer>
                      <Checkbox
                        checked={
                          configuration.ow_to_studio_config.tag_name !==
                          undefined
                        }
                        onChange={(e) => {
                          setConfiguration((prevState) => ({
                            ...prevState,
                            ow_to_studio_config: {
                              ...prevState.ow_to_studio_config,
                              tag_name: e.target.checked ? name : undefined,
                            },
                          }));
                        }}
                      >
                        Add configuration name as a metatag
                      </Checkbox>
                    </BorderedBottomContainer>
                  )}
                  {configuration.source.external_id !== '' && (
                    <>
                      {dataTypesLoading ? (
                        <CenteredLoader>
                          <LoadingBox
                            text="Loading..."
                            backgroundColor={Colors.white.hex()}
                            textColor={Colors.black.hex()}
                          />
                        </CenteredLoader>
                      ) : (
                        <>
                          <ContainerHeading style={{ marginBottom: '0.5rem' }}>
                            Data types
                          </ContainerHeading>
                          {availableWPS.length > 0 && (
                            <DatatypeSection
                              name={WELL_PLAN_SCENARIOS}
                              onChange={(selected) =>
                                handleDatatypeChange(ChangeType.WPS, selected)
                              }
                              objects={availableWPS}
                              selectedObjects={configuration.well_plan}
                            />
                          )}
                          {availableTargets.length > 0 && (
                            <DatatypeSection
                              name="Targets"
                              onChange={(selected) =>
                                handleDatatypeChange(
                                  ChangeType.TARGETS,
                                  selected
                                )
                              }
                              objects={availableTargets}
                              selectedObjects={configuration.targets}
                            />
                          )}
                        </>
                      )}
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
                  {configuration.well_plan.length > 0 && (
                    <li key="datatypeItemWPS">
                      {WELL_PLAN_SCENARIOS}
                      <div
                        key="connectorPointWPS"
                        id="connectorPoint0"
                        className="connectorPoint connectorPoint1"
                      />
                    </li>
                  )}
                  {configuration.targets.length > 0 && (
                    <li key="datatypeItemTargets">
                      Targets
                      <div
                        key="connectorPointTargets"
                        id="connectorPoint1"
                        className="connectorPoint connectorPoint2"
                      />
                    </li>
                  )}
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
          <ConfigArrow />
          <ConfigurationContainer>
            <header>
              <ContainerHeading>Petrel Studio</ContainerHeading>
              {targetUIState === ConfigUIState.CONFIRMED && (
                <>
                  <div>{configuration.target.external_id}</div>
                  <EditButton
                    type="primary"
                    onClick={() => setTargetUIState(ConfigUIState.CONFIGURING)}
                  >
                    Edit
                  </EditButton>
                </>
              )}
            </header>
            {targetUIState === ConfigUIState.INITIAL && (
              <main className="initial-main">
                <InitialState>
                  <p>No destination repository selected</p>
                  <Button
                    type="primary"
                    onClick={() => {
                      fetchRepositories().then((response) => {
                        if (!response[0].error) {
                          setTargetUIState(ConfigUIState.CONFIGURING);
                          setAvailableRepositories(response);
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
                  {foldersLoading ? (
                    <CenteredLoader>
                      <LoadingBox
                        text="Loading..."
                        backgroundColor={Colors.white.hex()}
                        textColor={Colors.black.hex()}
                      />
                    </CenteredLoader>
                  ) : (
                    <BorderedBottomContainer leftPad={false}>
                      <div>Select destination repository:</div>
                      <Select
                        value={
                          configuration.target.external_id.length > 0
                            ? configuration.target.external_id
                            : undefined
                        }
                        placeholder="Available repositories"
                        style={{ width: '100%', marginBottom: '16px' }}
                        onChange={(value) =>
                          handleChange(ChangeType.REPO, value)
                        }
                        suffixIcon={<Icon type="Down" />}
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
                    </BorderedBottomContainer>
                  )}
                  {availableDestinationFolders.length > 0 && (
                    <>
                      <div>Select destination folder:</div>
                      <Select
                        value={
                          configuration.ow_to_studio_config.folder &&
                          configuration.ow_to_studio_config.folder !== '_Root'
                            ? configuration.ow_to_studio_config.folder
                            : undefined
                        }
                        placeholder="Available folders"
                        style={{ width: '100%', marginBottom: '16px' }}
                        onChange={(value) =>
                          handleChange(ChangeType.DESTINATION_FOLDER, value)
                        }
                        suffixIcon={<Icon type="Down" />}
                      >
                        {availableDestinationFolders.map((folder) => (
                          <Option
                            key={folder.external_id}
                            value={folder.external_id}
                          >
                            {folder.name}
                          </Option>
                        ))}
                      </Select>
                    </>
                  )}
                  {configuration.target.external_id.length > 0 && (
                    <BorderedBottomContainer>
                      {/* Remove tooltip and disabled prop on Checkbox when API is ready */}
                      <Tooltip content="This feature is not implemented yet, but will be in later release">
                        <Checkbox
                          checked={
                            configuration.ow_to_studio_config.session_name !==
                            null
                          }
                          onChange={(e) => {
                            setConfiguration((prevState) => ({
                              ...prevState,
                              ow_to_studio_config: {
                                ...prevState.ow_to_studio_config,
                                session_name: e.target.checked ? name : null,
                              },
                            }));
                          }}
                          disabled
                        >
                          Create new folder with DSG session name
                        </Checkbox>
                      </Tooltip>
                    </BorderedBottomContainer>
                  )}
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
                    {configuration.ow_to_studio_config.folder
                      ? configuration.ow_to_studio_config.folder
                      : '_Root'}
                    {configuration.ow_to_studio_config.session_name !== null
                      ? `/${configuration.ow_to_studio_config.session_name}`
                      : ''}
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
            {configuration.well_plan.length > 0 && (
              <path
                key="connectorLineWPS"
                id="connectorLine0"
                className="connectorLine connectorLineWPS"
                d="M0 0"
                fill="transparent"
              />
            )}
            <path
              key="connectorLineTargets"
              id="connectorLine1"
              className="connectorLine connectorLineTargets"
              d="M0 0"
              fill="transparent"
            />
          </svg>
        </ConnectionLinesWrapper>
      )}
      {creationError && (
        <Modal
          visible={creationError !== null}
          okText="Close"
          cancelText=""
          onOk={() => setCreationError(null)}
          width={450}
          closeIcon={
            <CloseIcon
              type="LargeClose"
              onClick={() => setCreationError(null)}
            />
          }
        >
          <ErrorModal>
            <h2>Sorry! We failed to save your configuration</h2>
            <p>{creationError}</p>
            <div>
              <Button type="primary" onClick={() => window.location.reload()}>
                Start over
              </Button>
              <p>or</p>
              <Link to="/configurations">Go back to configurations list</Link>
            </div>
          </ErrorModal>
        </Modal>
      )}
    </>
  );
};

export default OpenWorksToPetrelStudio;
