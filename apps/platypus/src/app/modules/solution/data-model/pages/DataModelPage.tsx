import { useEffect, useState } from 'react';
import { PageContentLayout } from '@platypus-app/components/Layouts/PageContentLayout';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { Flex } from '@cognite/cogs.js';
import useSelector from '@platypus-app/hooks/useSelector';
import { DataModelState } from '@platypus-app/redux/reducers/global/dataModelReducer';
import { SplitPanelLayout } from '@platypus-app/components/Layouts/SplitPanelLayout';
import {
  formatValidationErrors,
  Notification,
} from '@platypus-app/components/Notification/Notification';
import { TOKENS } from '@platypus-app/di';
import {
  ErrorType,
  DataModelVersion,
  Result,
  getDataModelEndpointUrl,
  PlatypusError,
  PlatypusValidationError,
  ValidationError,
  PlatypusDmlError,
} from '@platypus/platypus-core';

import { DEFAULT_VERSION_PATH } from '@platypus-app/utils/config';
import { useDataModelState } from '../../hooks/useDataModelState';
import { SchemaEditorMode } from '../types';
import { EditorPanel } from '../components/EditorPanel';
import { DataModelHeader } from '../components/DataModelHeader';
import {
  PageToolbar,
  Size,
} from '@platypus-app/components/PageToolbar/PageToolbar';
import { SchemaVisualizer } from '@platypus-app/components/SchemaVisualizer/SchemaVisualizer';
import { ErrorBoundary } from '@platypus-app/components/ErrorBoundary/ErrorBoundary';
import { ErrorPlaceholder } from '../components/ErrorBoundary/ErrorPlaceholder';
import { useLocalDraft } from '@platypus-app/modules/solution/data-model/hooks/useLocalDraft';
import { useInjection } from '@platypus-app/hooks/useInjection';
import {
  useDataModel,
  useDataModelVersions,
  useSelectedDataModelVersion,
} from '@platypus-app/hooks/useDataModelActions';
import { useQueryClient } from '@tanstack/react-query';
import { useMixpanel } from '@platypus-app/hooks/useMixpanel';
import { QueryKeys } from '@platypus-app/utils/queryKeys';
import { EndpointModal } from '../components/EndpointModal';
import { getProject } from '@cognite/cdf-utilities';
import { getCogniteSDKClient } from '../../../../../environments/cogniteSdk';
import { ToggleVisualizer } from '../components/ToggleVisualizer/ToggleVisualizer';
import { usePersistedState } from '@platypus-app/hooks/usePersistedState';
import {
  PublishVersionModal,
  VersionType,
} from '../components/PublishVersionModal';
import { useNavigate } from '@platypus-app/flags/useNavigate';
import { getKeyForDataModel } from '@platypus-app/utils/local-storage-utils';

const MAX_TYPES_VISUALIZABLE = 30;

export interface DataModelPageProps {
  dataModelExternalId: string;
  space: string;
}

const formatDmlError = (error: PlatypusDmlError) => {
  return (
    <div
      key="errors"
      style={{
        display: 'block',
        overflowX: 'hidden',
        overflowY: 'auto',
        maxHeight: '150px',
      }}
    >
      <ul style={{ paddingLeft: '16px' }}>
        {error.errors.map((err) => {
          const prefix = `[Line: ${err.location.start.line}]`;
          let message = `${prefix} ${err.message}`;
          if (err.hint) {
            message += `\n${' '.repeat(prefix.length + 1)}${err.hint}`;
          }

          return (
            <li style={{ whiteSpace: 'pre-wrap' }} key={message}>
              {message}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export const DataModelPage = ({
  dataModelExternalId,
  space,
}: DataModelPageProps) => {
  const navigate = useNavigate();

  const { t } = useTranslation('SolutionDataModel');

  const { track } = useMixpanel();

  const { data: dataModelVersions, refetch: refetchDataModelVersions } =
    useDataModelVersions(dataModelExternalId, space);
  const queryClient = useQueryClient();
  const {
    currentTypeName,
    editorMode,
    graphQlSchema,
    selectedVersionNumber,
    typeDefs,
  } = useSelector<DataModelState>((state) => state.dataModel);
  const {
    setEditorMode,
    setGraphQlSchema,
    setIsDirty,
    parseGraphQLSchema,
    setCurrentTypeName,
  } = useDataModelState();
  const { data: dataModel } = useDataModel(dataModelExternalId, space);

  const { removeLocalDraft, getLocalDraft } = useLocalDraft(
    dataModelExternalId,
    dataModel?.space || ''
  );

  const selectedDataModelVersion = useSelectedDataModelVersion(
    selectedVersionNumber,
    dataModelVersions || [],
    dataModelExternalId,
    dataModel?.space || ''
  );
  const latestDataModelVersion = useSelectedDataModelVersion(
    DEFAULT_VERSION_PATH,
    dataModelVersions || [],
    dataModelExternalId,
    dataModel?.space || ''
  );
  const localDraft = getLocalDraft(selectedDataModelVersion.version);
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [breakingChanges, setBreakingChanges] = useState('');
  const [showEndpointModal, setShowEndpointModal] = useState(false);
  const [publishModalVersionType, setPublishModalVersionType] =
    useState<VersionType | null>(null);

  const dataModelTypeDefsBuilder = useInjection(
    TOKENS.dataModelTypeDefsBuilderService
  );
  const dataModelVersionHandler = useInjection(TOKENS.dataModelVersionHandler);

  /*
  If in view mode and there are no published versions, set to edit mode. This should
  only happen on mount and we can avoid using an effect here because that would involve
  a wasted render.
  */
  if (editorMode === SchemaEditorMode.View && dataModelVersions?.length === 0) {
    setEditorMode(SchemaEditorMode.Edit);
  }

  const handleDataModelVersionSelect = (dataModelVersion: DataModelVersion) => {
    dataModelTypeDefsBuilder.clear();
    navigate(
      `/${dataModel?.space}/${dataModelExternalId}/${dataModelVersion.version}/data`,
      { replace: true }
    );
  };

  const [isVisualizerOn, setIsVisualizerOn] = usePersistedState(
    true,
    getKeyForDataModel(
      dataModel?.space || '',
      dataModelExternalId,
      'isVisualizerOn'
    )
  );

  // Use this hook as init livecycle
  useEffect(() => {
    if (localDraft) {
      setGraphQlSchema(localDraft.schema);
      parseGraphQLSchema(localDraft.schema);
      setEditorMode(SchemaEditorMode.Edit);
      setIsDirty(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClickPublish = async () => {
    setUpdating(true);

    try {
      const dataModelValidationResult = await dataModelVersionHandler.validate({
        ...selectedDataModelVersion,
        space: dataModelExternalId,
        schema: graphQlSchema,
        version: selectedDataModelVersion?.version,
      });
      const versionType: VersionType =
        dataModelVersions && dataModelVersions?.length > 0
          ? 'SUBSEQUENT'
          : 'FIRST';

      if (dataModelValidationResult.isFailure) {
        const error = PlatypusError.fromDataModelValidationError(
          dataModelValidationResult.errorValue()
        );

        if ((error?.type as ErrorType) === 'BREAKING_CHANGE') {
          setBreakingChanges(error.message);
          setPublishModalVersionType(versionType);
        } else if (error instanceof PlatypusValidationError) {
          Notification({
            type: 'error',
            title: 'Error: could not validate data model',
            message: error.message,
            extra: formatValidationErrors(error.errors),
          });
        }
      } else {
        setPublishModalVersionType(versionType);
      }
    } catch (error) {
      Notification({
        type: 'error',
        title: 'Error: could not validate data model',
        message: t(
          'schema_validation_error',
          `Validation of the data model failed. ${error}`
        ),
      });
    }

    setUpdating(false);
  };

  const getSuggestedVersion = () => {
    if (publishModalVersionType === 'FIRST') return '1';

    const publishedVersions =
      dataModelVersions?.map((ver) => ver.version) || [];
    const currentVersion = parseInt(selectedDataModelVersion.version, 10);

    let suggestedVersion =
      !isNaN(currentVersion) &&
      !publishedVersions.includes(`${currentVersion + 1}`)
        ? currentVersion + 1
        : publishedVersions.length + 1;

    while (publishedVersions.includes(`${suggestedVersion}`))
      suggestedVersion += 1;

    return `${suggestedVersion}`;
  };

  const handleSaveOrPublish = async (newVersion: string) => {
    try {
      const version = selectedDataModelVersion?.version;
      const draftVersion = version;
      let result: Result<DataModelVersion>;
      const publishNewVersion =
        breakingChanges ||
        !dataModelVersions ||
        dataModelVersions.length === 0 ||
        newVersion !== version;

      if (publishNewVersion) {
        setUpdating(true);
        result = await dataModelVersionHandler.publish(
          {
            ...selectedDataModelVersion,
            externalId: dataModelExternalId,
            schema: graphQlSchema,
            version: newVersion,
          },
          'NEW_VERSION'
        );

        if (breakingChanges) {
          track('BreakingChanges', {
            dataModel: dataModelExternalId,
          });
        }
      } else {
        setSaving(true);
        result = await dataModelVersionHandler.publish(
          {
            ...selectedDataModelVersion,
            externalId: dataModelExternalId,
            schema: graphQlSchema,
            version: newVersion,
          },
          'PATCH'
        );
      }

      if (result.error?.type as ErrorType) {
        Notification({
          type: 'error',
          title: 'Error: could not update data model',
          message: result.error.message,
          extra:
            result.error instanceof PlatypusDmlError
              ? formatDmlError(result.error)
              : formatValidationErrors(
                  result.error.errors as ValidationError[]
                ),
        });
      }

      if (result.isSuccess) {
        track('Publishing', {
          dataModel: dataModelExternalId,
        });
        removeLocalDraft(draftVersion);
        setIsDirty(false);

        if (publishNewVersion) {
          // add new version to react-query cache and then refetch
          queryClient.setQueryData<DataModelVersion[]>(
            QueryKeys.DATA_MODEL_VERSION_LIST(dataModelExternalId),
            (oldDataModelVersions = []) => {
              return [...oldDataModelVersions, result.getValue()];
            }
          );

          refetchDataModelVersions();
          navigate(
            `/${dataModel?.space}/${dataModelExternalId}/${DEFAULT_VERSION_PATH}/data`,
            { replace: true }
          );
        } else {
          // update version in react-query cache and then refetch
          queryClient.setQueryData<DataModelVersion[]>(
            QueryKeys.DATA_MODEL_VERSION_LIST(dataModelExternalId),
            (oldDataModelVersions = []) => {
              return oldDataModelVersions.map((dataModelVersion) => {
                return dataModelVersion.version === version
                  ? result.getValue()
                  : dataModelVersion;
              });
            }
          );
          refetchDataModelVersions();
        }

        Notification({
          type: 'success',
          title: t(
            `data_model_${
              publishNewVersion ? 'published' : 'updated'
            }_toast_title`,
            `Data model ${publishNewVersion ? 'published' : 'updated'}`
          ),
          message: `${t('version', 'Version')} ${newVersion} ${t(
            'of_your_data_model_was_successfully',
            'of your data model was successfully'
          )} ${
            publishNewVersion
              ? t('published', 'published')
              : t('updated', 'updated')
          }.`,
        });
        // Must be located here for fetching versions correctly and updating schema version selector.
        //
        setEditorMode(SchemaEditorMode.View);
      }
    } catch (error) {
      Notification({
        type: 'error',
        title: 'Error: could not save data model',
        message: t(
          'schema_save_error',
          `Saving of the data model failed. ${error}`
        ),
      });
    }
    // Must be located here to work correctly with Promt.
    setUpdating(false);
    setSaving(false);
    setPublishModalVersionType(null);
    setBreakingChanges('');
  };

  const handleDiscardClick = () => {
    dataModelTypeDefsBuilder.clear();
    setGraphQlSchema(latestDataModelVersion.schema);
  };

  return (
    <>
      <PageContentLayout>
        <PageContentLayout.Header>
          <DataModelHeader
            dataModelExternalId={dataModelExternalId}
            dataModelSpace={dataModel?.space || ''}
            dataModelVersions={dataModelVersions}
            isSaving={saving}
            isUpdating={updating}
            latestDataModelVersion={latestDataModelVersion}
            localDraft={localDraft}
            onDiscardClick={handleDiscardClick}
            onPublishClick={handleClickPublish}
            onEndpointClick={() => setShowEndpointModal(true)}
            title={t('data_model_title', 'Data model')}
            onDataModelVersionSelect={handleDataModelVersionSelect}
            selectedDataModelVersion={selectedDataModelVersion}
          />
        </PageContentLayout.Header>
        <PageContentLayout.Body style={{ flexDirection: 'row' }}>
          <SplitPanelLayout
            sidebar={
              <ErrorBoundary errorComponent={<ErrorPlaceholder />}>
                <EditorPanel
                  editorMode={editorMode}
                  space={dataModel?.space || ''}
                  version={selectedDataModelVersion.version}
                  externalId={dataModelExternalId}
                  isPublishing={saving || updating}
                />
              </ErrorBoundary>
            }
            sidebarWidth={640}
            sidebarMinWidth={440}
            content={
              <Flex
                data-testid="Schema_visualization"
                direction="column"
                style={{ height: '100%' }}
              >
                <PageToolbar
                  title={t('preview_title', 'Preview')}
                  size={Size.SMALL}
                >
                  {typeDefs.types.length > MAX_TYPES_VISUALIZABLE && (
                    <ToggleVisualizer
                      isVisualizerOn={isVisualizerOn}
                      setIsVisualizerOn={setIsVisualizerOn}
                    />
                  )}
                </PageToolbar>
                <ErrorBoundary errorComponent={<ErrorPlaceholder />}>
                  <SchemaVisualizer
                    active={currentTypeName || undefined}
                    graphQLSchemaString={graphQlSchema}
                    onNodeClick={(nodeName) => setCurrentTypeName(nodeName)}
                    isVisualizerOn={
                      typeDefs.types.length <= MAX_TYPES_VISUALIZABLE ||
                      isVisualizerOn
                    }
                  />
                </ErrorBoundary>
              </Flex>
            }
          />
          )
        </PageContentLayout.Body>
      </PageContentLayout>

      {showEndpointModal && (
        <EndpointModal
          endpoint={getDataModelEndpointUrl(
            getProject(),
            selectedDataModelVersion.externalId,
            selectedDataModelVersion.version,
            getCogniteSDKClient().getBaseUrl()
          )}
          onRequestClose={() => setShowEndpointModal(false)}
        />
      )}

      {publishModalVersionType && (
        <PublishVersionModal
          versionType={publishModalVersionType}
          suggestedVersion={getSuggestedVersion()}
          currentVersion={`${selectedDataModelVersion.version || '1'}`}
          publishedVersions={dataModelVersions?.map((ver) => ver.version) || []}
          breakingChanges={breakingChanges}
          onCancel={() => {
            setBreakingChanges('');
            setPublishModalVersionType(null);
          }}
          onUpdate={handleSaveOrPublish}
          isUpdating={updating}
          isSaving={saving}
        />
      )}
    </>
  );
};
