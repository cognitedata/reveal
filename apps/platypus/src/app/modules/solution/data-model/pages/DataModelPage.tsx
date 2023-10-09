import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import {
  ErrorType,
  DataModelVersion,
  Result,
  PlatypusError,
  PlatypusValidationError,
  ValidationError,
  PlatypusDmlError,
} from '@platypus/platypus-core';
import { useQueryClient } from '@tanstack/react-query';

import { createLink, useCdfUserHistoryService } from '@cognite/cdf-utilities';
import { Flex } from '@cognite/cogs.js';

import { ErrorBoundary } from '../../../../components/ErrorBoundary/ErrorBoundary';
import { PageContentLayout } from '../../../../components/Layouts/PageContentLayout';
import { SplitPanelLayout } from '../../../../components/Layouts/SplitPanelLayout';
import {
  formatValidationErrors,
  Notification,
} from '../../../../components/Notification/Notification';
import {
  PageToolbar,
  Size,
} from '../../../../components/PageToolbar/PageToolbar';
import { SchemaVisualizer } from '../../../../components/SchemaVisualizer/SchemaVisualizer';
import { SUB_APP_PATH } from '../../../../constants';
import { TOKENS } from '../../../../di';
import { useNavigate } from '../../../../flags/useNavigate';
import { useDataModelVersions } from '../../../../hooks/useDataModelActions';
import { useInjection } from '../../../../hooks/useInjection';
import { useMixpanel } from '../../../../hooks/useMixpanel';
import { usePersistedState } from '../../../../hooks/usePersistedState';
import { useSelectedDataModelVersion } from '../../../../hooks/useSelectedDataModelVersion';
import useSelector from '../../../../hooks/useSelector';
import { useTranslation } from '../../../../hooks/useTranslation';
import { DataModelState } from '../../../../redux/reducers/global/dataModelReducer';
import { DEFAULT_VERSION_PATH } from '../../../../utils/config';
import { getKeyForDataModel } from '../../../../utils/local-storage-utils';
import { QueryKeys } from '../../../../utils/queryKeys';
import { useDataModelState } from '../../hooks/useDataModelState';
import { DataModelHeader } from '../components/DataModelHeader';
import { EditorPanel } from '../components/EditorPanel';
import { ErrorPlaceholder } from '../components/ErrorBoundary/ErrorPlaceholder';
import { ErrorsByGroup } from '../components/GraphqlCodeEditor/Model';
import { ImportTypesModal } from '../components/ImportTypesModal';
import {
  PublishVersionModal,
  VersionType,
} from '../components/PublishVersionModal';
import { ToggleVisualizer } from '../components/ToggleVisualizer/ToggleVisualizer';
import { useLocalDraft } from '../hooks/useLocalDraft';
import { SchemaEditorMode } from '../types';

const MAX_TYPES_VISUALIZABLE = 30;

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

export const DataModelPage = () => {
  const { pathname: dataModelPathname } = useLocation();
  const userHistoryService = useCdfUserHistoryService();

  const navigate = useNavigate();
  const { dataModelExternalId, space, version } = useParams() as {
    dataModelExternalId: string;
    space: string;
    version: string;
  };

  const { t } = useTranslation('SolutionDataModel');

  const { track } = useMixpanel();

  const { data: dataModelVersions, refetch: refetchDataModelVersions } =
    useDataModelVersions(dataModelExternalId, space);
  const queryClient = useQueryClient();
  const { currentTypeName, editorMode, graphQlSchema, typeDefs } =
    useSelector<DataModelState>((state) => state.dataModel);
  const {
    dataModelPublished,
    setEditorMode,
    updateGraphQlSchema,
    setCurrentTypeName,
    switchDataModelVersion,
  } = useDataModelState();

  const { dataModelVersion: selectedDataModelVersion } =
    useSelectedDataModelVersion(version, dataModelExternalId, space);
  const { dataModelVersion: latestDataModelVersion } =
    useSelectedDataModelVersion(
      DEFAULT_VERSION_PATH,
      dataModelExternalId,
      space
    );
  const { removeLocalDraft, getLocalDraft } = useLocalDraft(
    dataModelExternalId,
    space,
    latestDataModelVersion
  );

  const localDraft = getLocalDraft(selectedDataModelVersion.version);
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editorHasError, setEditorHasError] = useState(false);
  const [showImportTypes, setShowImportTypes] = useState(false);
  const [breakingChanges, setBreakingChanges] = useState('');
  const [publishModalVersionType, setPublishModalVersionType] =
    useState<VersionType | null>(null);
  const [errorsByGroup, setErrorsByGroup] = useState<ErrorsByGroup>({
    DmlError: [],
  });

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
    navigate(`/${space}/${dataModelExternalId}/${dataModelVersion.version}`, {
      replace: true,
    });
  };

  const [isVisualizerOn, setIsVisualizerOn] = usePersistedState(
    true,
    getKeyForDataModel(space, dataModelExternalId, 'isVisualizerOn')
  );

  // Use this effect as init lifecycle
  useEffect(() => {
    switchDataModelVersion(localDraft || selectedDataModelVersion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // save data-model view action to user history
    if (dataModelExternalId.trim())
      userHistoryService.logNewResourceView({
        application: SUB_APP_PATH,
        name: dataModelExternalId.trim(),
        path: createLink(dataModelPathname),
      });
  }, [userHistoryService, dataModelExternalId, dataModelPathname]);

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
      // Clear old errors
      setErrorsByGroup({ DmlError: [] });

      // need to get draftVersion from selected data model;
      // if we get it from the url params then it might be "latest"
      const draftVersion = selectedDataModelVersion.version;
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
            previousVersion: selectedDataModelVersion?.version,
          },
          'NEW_VERSION'
        );

        track('DataModel.Edit', {
          dataModel: dataModelExternalId,
        });
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
        if (result.error instanceof PlatypusDmlError) {
          setErrorsByGroup({
            DmlError: result.error.errors.map((err) => ({
              severity: 8,
              message: err.message + (err.hint ? '\n' + err.hint : ''),
              startLineNumber: err.location.start.line,
              startColumn: err.location.start.column,
              endColumn: err.location.end?.column || 1000,
              endLineNumber: err.location.end?.line || err.location.start.line,
            })),
          });
        }

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
        track('DataModel.Publish', {
          dataModel: dataModelExternalId,
          version: newVersion,
        });
        removeLocalDraft(draftVersion);
        dataModelPublished();

        const publishedVersionPath = `/${space}/${dataModelExternalId}/${DEFAULT_VERSION_PATH}`;
        if (publishNewVersion) {
          // add new version to react-query cache and then refetch
          queryClient.setQueryData<DataModelVersion[]>(
            QueryKeys.DATA_MODEL_VERSION_LIST(space, dataModelExternalId),
            (oldDataModelVersions = []) => {
              return [...oldDataModelVersions, result.getValue()];
            }
          );
          refetchDataModelVersions();
          navigate(publishedVersionPath, {
            replace: true,
          });
        } else {
          // update version in react-query cache and then refetch
          queryClient.setQueryData<DataModelVersion[]>(
            QueryKeys.DATA_MODEL_VERSION_LIST(space, dataModelExternalId),
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

        // save data-model publish(edit) action to user history
        if (dataModelExternalId.trim())
          userHistoryService.logNewResourceEdit({
            application: SUB_APP_PATH,
            name: dataModelExternalId.trim(), // how to get data-model name here?
            path: createLink(publishedVersionPath),
          });

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
    track('DataModel.Draft.Delete');
    dataModelTypeDefsBuilder.clear();
    updateGraphQlSchema(latestDataModelVersion.schema);
  };

  const handleImportTypesClick = () => {
    track('DataModel.ImportTypes');
    setShowImportTypes(true);
  };

  return (
    <>
      <PageContentLayout>
        <PageContentLayout.Header>
          <DataModelHeader
            dataModelExternalId={dataModelExternalId}
            dataModelSpace={space}
            dataModelVersions={dataModelVersions}
            isSaving={saving}
            isUpdating={updating}
            editorHasError={editorHasError}
            latestDataModelVersion={latestDataModelVersion}
            localDraft={localDraft}
            onDiscardClick={handleDiscardClick}
            onImportTypesClick={handleImportTypesClick}
            onPublishClick={handleClickPublish}
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
                  setEditorHasError={setEditorHasError}
                  space={space}
                  version={selectedDataModelVersion.version}
                  externalId={dataModelExternalId}
                  isPublishing={saving || updating}
                  errorsByGroup={errorsByGroup}
                  setErrorsByGroup={setErrorsByGroup}
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
        </PageContentLayout.Body>
      </PageContentLayout>

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

      {showImportTypes && (
        <ImportTypesModal onClose={() => setShowImportTypes(false)} />
      )}
    </>
  );
};
