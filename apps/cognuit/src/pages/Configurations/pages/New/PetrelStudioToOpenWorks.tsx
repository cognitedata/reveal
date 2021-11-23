import { useContext, useEffect, useState, useMemo, FC } from 'react';
import { Button, Modal } from '@cognite/cogs.js';
import { Source } from 'typings/interfaces';
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
import { notification } from 'components/Molecules/notification';

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
import { ConfigUIState, Origin } from './types';
import { useSourceConfiguration } from './hooks/useSourceConfiguration';

interface Props {
  name: string | null;
}

const PetrelStudioToOpenWorks: FC<Props> = ({ name }) => {
  const { addError } = useContext(APIErrorContext);
  const history = useHistory();

  const { configuration, onConfigurationChange } = useSourceConfiguration({
    name,
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
    instance: null,
    enabled: sourceUIState !== ConfigUIState.INITIAL,
  });

  const { data: availableProjects } = useProjectsQuery({
    source: Source.OPENWORKS,
    instance: null,
    enabled: targetUIState !== ConfigUIState.INITIAL,
  });

  const { data: availableDataStatus } = useDataStatusQuery({
    enabled: sourceUIState !== ConfigUIState.INITIAL,
  });

  const { data: availableBusinessTags } = useProjectsBusinessTagsQuery({
    project: configuration.source,
    enabled: !!(
      configuration.source.source &&
      configuration.source.instance &&
      configuration.source.external_id
    ),
  });

  const repoId = useMemo(() => {
    return getRepositoryIdInArrayFromExternalId(
      availableRepositories,
      configuration.source
    );
  }, [configuration.source]);

  const { data: availableDataTypes } = useDatatypesQuery({
    id: repoId,
    enabled: !!repoId,
  });

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
      configuration.datatypes.length > 0 &&
      configuration.business_tags.length > 0 &&
      configuration.data_status.length > 0
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
            handleChange={onConfigurationChange}
          />

          <ConfigArrow />

          <TargetOrigin
            targetComplete={targetComplete}
            targetUIState={targetUIState}
            configuration={configuration}
            availableProjects={availableProjects}
            onUiStateChange={handleUiStateChange}
            handleChange={onConfigurationChange}
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
