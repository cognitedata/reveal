import { useContext, useEffect, useState, useMemo, FC } from 'react';
import { Button, Modal } from '@cognite/cogs.js';
import { notification } from 'antd';
import { NewConfiguration, Source } from 'typings/interfaces';
import { AuthProvider, AuthContext } from '@cognite/react-container';
import { SelectValue } from 'antd/es/select';
import APIErrorContext from 'contexts/APIErrorContext';
import { Link, useHistory } from 'react-router-dom';
import { CustomError } from 'services/CustomError';
import {
  useProjectsBusinessTagsQuery,
  useProjectsQuery,
} from 'services/endpoints/projects/query';
import { useDatatypesQuery } from 'services/endpoints/datatypes/query';
import { useConfigurationsMutation } from 'services/endpoints/configurations/mutation';
import { useDataStatusQuery } from 'services/endpoints/datastatus/query';

import {
  CloseIcon,
  ConfigurationsMainContainer,
  ConnectionLinesWrapper,
  ErrorModal,
  Header,
  SaveButton,
  ThreeColsLayout,
  Title,
} from './elements';
import { TargetOrigin, SourceOrigin } from './components/PsToOwContainer';
import {
  getRepositoryIdInArrayFromExternalId,
  makeConnectorLines,
} from './utils';
import ConfigArrow from './components/ConfigArrow';
import { ChangeType, ConfigUIState, Origin } from './types';

interface Props {
  name: string | null;
}

const PetrelStudioToOpenWorks: FC<Props> = ({ name }) => {
  const { authState } = useContext<AuthContext>(AuthProvider);
  const { addError } = useContext(APIErrorContext);
  const history = useHistory();

  const user = authState?.email;

  const [configuration, setConfiguration] = useState<NewConfiguration>({
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
    data_status: [],
  });

  const [configurationIsComplete, setConfigurationIsComplete] =
    useState<boolean>(false);

  const [sourceUIState, setSourceUIState] = useState<ConfigUIState>(
    ConfigUIState.INITIAL
  );
  const [targetUIState, setTargetUIState] = useState<ConfigUIState>(
    ConfigUIState.INITIAL
  );
  const [sourceComplete, setSourceComplete] = useState<boolean>(false);
  const [targetComplete, setTargetComplete] = useState<boolean>(false);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [creationError, setCreationError] = useState<string | null>(null);

  const { createConfigurations } = useConfigurationsMutation();

  const { data: availableRepositories } = useProjectsQuery({
    source: Source.STUDIO,
    enabled: sourceUIState !== ConfigUIState.INITIAL,
  });

  const { data: availableProjects } = useProjectsQuery({
    source: Source.OPENWORKS,
    enabled: targetUIState !== ConfigUIState.INITIAL,
  });

  const { data: availableDataStatus } = useDataStatusQuery({
    enabled: sourceUIState !== ConfigUIState.INITIAL,
  });

  const { data: availableBusinessTags } = useProjectsBusinessTagsQuery({
    repository: configuration.source.external_id,
    source: configuration.source.source,
    enabled: !!(
      configuration.source.source && configuration.source.external_id
    ),
  });

  const repoId = useMemo(() => {
    return getRepositoryIdInArrayFromExternalId(
      availableRepositories,
      configuration.source.external_id
    );
  }, [configuration.source.external_id]);

  const { data: availableDataTypes } = useDatatypesQuery({
    id: repoId,
    enabled: !!repoId,
  });

  function updateSourceRepository(value: SelectValue) {
    setConfiguration((prevState) => ({
      ...prevState,
      source: { ...prevState.source, external_id: (value || '').toString() },
      business_tags: [],
      datatypes: [],
      data_status: [],
    }));
  }

  function updateTargetProject(value: SelectValue) {
    setConfiguration((prevState) => ({
      ...prevState,
      target: { ...prevState.target, external_id: (value || '').toString() },
    }));
  }

  function updateBusinessTags(value: any) {
    setConfiguration((prevState) => ({
      ...prevState,
      business_tags: value,
    }));
  }

  function updateDataTypes(value: any) {
    setConfiguration((prevState) => ({
      ...prevState,
      datatypes: value,
    }));
  }

  function updateDataStatus(value: any) {
    setConfiguration((prevState) => ({
      ...prevState,
      data_status: value,
    }));
  }

  function handleChange(type: ChangeType, value: any) {
    if (type === ChangeType.REPO) {
      updateSourceRepository(value);
    } else if (type === ChangeType.PROJECT) {
      updateTargetProject(value);
    } else if (type === ChangeType.TAGS) {
      updateBusinessTags(value);
    } else if (type === ChangeType.DATATYPES) {
      updateDataTypes(value);
    } else if (type === ChangeType.DATASTATUS) {
      updateDataStatus(value);
    }
  }

  const handleUiStateChange = (origin: Origin, newState: ConfigUIState) => {
    const setStateFn =
      origin === Origin.SOURCE ? setSourceUIState : setTargetUIState;
    setStateFn(newState);
  };

  function handleSaveConfigurationClick() {
    setIsSaving(true);

    createConfigurations
      .mutateAsync(configuration)
      .then(() => {
        setIsSaving(false);
        notification.success({
          message: 'Configuration created',
          description: 'Configuration was created successfully',
        });
        history.push('/configurations'); // Bug in react-router-dom - does not render after history.push()
      })
      .catch((err: CustomError) => {
        setIsSaving(false);
        addError(`Failed to save configuration - ${err.message}`, err.status);
        setCreationError(`Server status: - ${err.status}: ${err.message}`);
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

  useEffect(() => {
    // clear the selected date types when the users change "state"
    updateDataTypes([]);
  }, [configuration.source.external_id]);

  useEffect(() => {
    setConfiguration((prevState) => ({
      ...prevState,
      author: String(user),
    }));
  }, [user]);

  return (
    <>
      <ConfigurationsMainContainer>
        <Header>
          <Title>{name}</Title>
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
          <SourceOrigin
            sourceComplete={sourceComplete}
            sourceUIState={sourceUIState}
            targetUIState={targetUIState}
            configuration={configuration}
            availableRepositories={availableRepositories}
            availableBusinessTags={availableBusinessTags}
            availableDataTypes={availableDataTypes}
            availableDataStatus={availableDataStatus}
            onUiStateChange={handleUiStateChange}
            handleChange={handleChange}
          />

          <ConfigArrow />

          <TargetOrigin
            targetComplete={targetComplete}
            targetUIState={targetUIState}
            configuration={configuration}
            availableProjects={availableProjects}
            onUiStateChange={handleUiStateChange}
            handleChange={handleChange}
          />
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

export default PetrelStudioToOpenWorks;
