import { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { PageContentLayout } from '@platypus-app/components/Layouts/PageContentLayout';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { Button, Flex } from '@cognite/cogs.js';
import useSelector from '@platypus-app/hooks/useSelector';
import { DataModelState } from '@platypus-app/redux/reducers/global/dataModelReducer';
import { SplitPanelLayout } from '@platypus-app/components/Layouts/SplitPanelLayout';
import { Notification } from '@platypus-app/components/Notification/Notification';
import { TOKENS } from '@platypus-app/di';
import {
  ErrorType,
  BuiltInType,
  DataModelVersionStatus,
  DataModelVersion,
  Result,
} from '@platypus/platypus-core';

import { DEFAULT_VERSION_PATH } from '@platypus-app/utils/config';
import { useDataModelState } from '../../hooks/useDataModelState';
import { SchemaEditorMode } from '../types';
import { BreakingChangesModal } from '../components/BreakingChangesModal';
import { EditorPanel } from '../components/EditorPanel';
import { DataModelHeader } from '../../../../components/DataModelHeader';
import {
  PageToolbar,
  Size,
} from '@platypus-app/components/PageToolbar/PageToolbar';
import { SchemaVisualizer } from '@platypus-app/components/SchemaVisualizer/SchemaVisualizer';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { ErrorBoundary } from '@platypus-app/components/ErrorBoundary/ErrorBoundary';
import { ErrorPlaceholder } from '../components/ErrorBoundary/ErrorPlaceholder';
import { useLocalDraft } from '@platypus-app/modules/solution/data-model/hooks/useLocalDraft';
import { DiscardButton, ReturnButton } from './elements';
import { useInjection } from '@platypus-app/hooks/useInjection';
import {
  useDataModelVersions,
  useSelectedDataModelVersion,
} from '@platypus-app/hooks/useDataModelActions';
import { useQueryClient } from 'react-query';

export interface DataModelPageProps {
  dataModelExternalId: string;
}

export const DataModelPage = ({ dataModelExternalId }: DataModelPageProps) => {
  const history = useHistory();

  const { t } = useTranslation('SolutionDataModel');

  const { data: dataModelVersions, refetch: refetchDataModelVersions } =
    useDataModelVersions(dataModelExternalId);
  const queryClient = useQueryClient();
  const {
    currentTypeName,
    graphQlSchema,
    isDirty,
    selectedVersionNumber,
    typeFieldErrors,
  } = useSelector<DataModelState>((state) => state.dataModel);
  const {
    setCurrentTypeName,
    setGraphQlSchema,
    setIsDirty,
    setSelectedVersionNumber,
  } = useDataModelState();
  const {
    setLocalDraft,
    removeLocalDraft,
    getRemoteAndLocalSchemas,
    getLocalDraft,
  } = useLocalDraft(dataModelExternalId);

  const selectedDataModelVersion = useSelectedDataModelVersion(
    selectedVersionNumber,
    dataModelVersions || [],
    dataModelExternalId
  );
  const latestDataModelVersion = useSelectedDataModelVersion(
    DEFAULT_VERSION_PATH,
    dataModelVersions || [],
    dataModelExternalId
  );
  const localDraft = getLocalDraft(selectedDataModelVersion.version);

  const [mode, setMode] = useState<SchemaEditorMode>(
    localDraft || dataModelVersions?.length === 0
      ? SchemaEditorMode.Edit
      : SchemaEditorMode.View
  );
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [isInit, setInit] = useState(false);
  const [breakingChanges, setBreakingChanges] = useState('');
  const [builtInTypes, setBuiltInTypes] = useState<BuiltInType[]>([]);
  const dataModelTypeDefsBuilder = useInjection(
    TOKENS.dataModelTypeDefsBuilderService
  );
  const dataModelVersionHandler = useInjection(TOKENS.dataModelVersionHandler);

  const onSelectDataModelVersion = (dataModelVersion: DataModelVersion) => {
    dataModelTypeDefsBuilder.clear();
    setGraphQlSchema(dataModelVersion.schema);
    setIsDirty(false);
    setCurrentTypeName(null);
    setSelectedVersionNumber(dataModelVersion.version);
    setMode(
      dataModelVersion.status === DataModelVersionStatus.DRAFT
        ? SchemaEditorMode.Edit
        : SchemaEditorMode.View
    );
    history.replace(
      `/data-models/${dataModelExternalId}/${dataModelVersion.version}/data`
    );
  };

  useEffect(() => {
    function fetchSchemaAndTypes() {
      const builtInTypesResponse = dataModelTypeDefsBuilder.getBuiltinTypes();
      setBuiltInTypes(builtInTypesResponse);
      dataModelTypeDefsBuilder.clear();
      setGraphQlSchema(selectedDataModelVersion.schema);
      setInit(true);
    }

    if (!isInit) {
      fetchSchemaAndTypes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDataModelVersion, isInit]);

  useEffect(() => {
    if (localDraft) {
      dataModelTypeDefsBuilder.clear();
      setGraphQlSchema(localDraft.schema);
      setMode(SchemaEditorMode.Edit);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSaveOrPublish = async () => {
    try {
      const publishNewVersion =
        breakingChanges || !dataModelVersions || dataModelVersions.length === 0;
      let version = selectedDataModelVersion?.version;
      const draftVersion = version;
      let result: Result<DataModelVersion>;

      if (publishNewVersion) {
        setUpdating(true);
        version = dataModelVersions?.length
          ? (parseInt(selectedDataModelVersion?.version) + 1).toString()
          : '1';
        result = await dataModelVersionHandler.publish(
          {
            ...selectedDataModelVersion,
            externalId: dataModelExternalId,
            schema: graphQlSchema,
            version: version,
          },
          'NEW_VERSION'
        );
        setBreakingChanges('');
      } else {
        setSaving(true);
        result = await dataModelVersionHandler.publish(
          {
            ...selectedDataModelVersion,
            externalId: dataModelExternalId,
            schema: graphQlSchema,
            version: version,
          },
          'PATCH'
        );
      }

      if ((result.error?.type as ErrorType) === 'BREAKING_CHANGE') {
        setBreakingChanges(result.error.message);
      } else if (result.error?.type as ErrorType) {
        Notification({
          type: 'error',
          title: 'Error: could not update data model',
          message: result.error.message,
          validationErrors: result.error.errors || [],
        });
      }

      if (result.isSuccess) {
        removeLocalDraft(draftVersion);
        setIsDirty(false);

        if (publishNewVersion) {
          // add new version to react-query cache and then refetch
          queryClient.setQueryData<DataModelVersion[]>(
            ['dataModelVersions', dataModelExternalId],
            (oldDataModelVersions = []) => {
              return [...oldDataModelVersions, result.getValue()];
            }
          );
          refetchDataModelVersions();

          history.replace(
            `/data-models/${dataModelExternalId}/${DEFAULT_VERSION_PATH}/data`
          );
        } else {
          // update version in react-query cache and then refetch
          queryClient.setQueryData<DataModelVersion[]>(
            ['dataModelVersions', dataModelExternalId],
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
          message: `${t('version', 'Version')} ${version} ${t(
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
        setMode(SchemaEditorMode.View);
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
  };

  const onSchemaChanged = useCallback(
    (schemaString) => {
      setGraphQlSchema(schemaString);
      setIsDirty(selectedDataModelVersion.schema !== schemaString);

      setLocalDraft({
        ...selectedDataModelVersion,
        schema: schemaString,
        status: DataModelVersionStatus.DRAFT,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedDataModelVersion]
  );

  const renderTools = () => {
    const onEditClick = () => {
      if (localDraft) {
        setGraphQlSchema(localDraft.schema);
      } else {
        setLocalDraft({
          ...selectedDataModelVersion,
          status: DataModelVersionStatus.DRAFT,
        });
      }

      setMode(SchemaEditorMode.Edit);
    };

    const onDiscardClick = () => {
      // if there is no published version yet, stay in edit mode
      if (dataModelVersions && dataModelVersions.length > 0) {
        setMode(SchemaEditorMode.View);
      }
      if (localDraft) {
        removeLocalDraft(localDraft.version);
      }
      setIsDirty(false);
      dataModelTypeDefsBuilder.clear();
      setCurrentTypeName(null);
      setSelectedVersionNumber(DEFAULT_VERSION_PATH);
      setInit(false);
    };

    const onReturnToLatestClick = () => {
      onSelectDataModelVersion(latestDataModelVersion);
    };

    if (mode === SchemaEditorMode.Edit) {
      return (
        <div data-cy="data-model-toolbar-actions" style={{ display: 'flex' }}>
          <DiscardButton
            type="secondary"
            data-cy="discard-btn"
            disabled={saving || updating}
            onClick={onDiscardClick}
            style={{ marginRight: '10px' }}
          >
            {t('discard_changes', 'Discard changes')}
          </DiscardButton>

          <Button
            type="primary"
            data-cy="publish-schema-btn"
            onClick={() => {
              onSaveOrPublish();
            }}
            loading={saving || updating}
            disabled={
              !isDirty ||
              !graphQlSchema ||
              selectedDataModelVersion.schema === graphQlSchema ||
              Object.keys(typeFieldErrors).length !== 0
            }
          >
            {t('publish', 'Publish')}
          </Button>
        </div>
      );
    }

    if (selectedDataModelVersion.version !== latestDataModelVersion.version) {
      return (
        <Flex
          className="cogs-body-2 strong"
          style={{
            backgroundColor: 'var(--cogs-border--status-warning--muted)',
            borderRadius: '6px',
            flexGrow: 1,
            height: '36px',
            marginLeft: '8px',
            padding: '0 12px',
          }}
        >
          <Flex
            alignItems="center"
            justifyContent="space-between"
            style={{ flexGrow: 1 }}
          >
            {t('viewing_older_version', 'You are viewing an older version')}
            <ReturnButton
              data-cy="return-to-latest-btn"
              iconPlacement="left"
              icon="Reply"
              onClick={onReturnToLatestClick}
            >
              {t('return_to_latest', 'Return to latest')}
            </ReturnButton>
          </Flex>
        </Flex>
      );
    }

    return (
      <Button
        type="primary"
        data-cy="edit-schema-btn"
        onClick={onEditClick}
        className="editButton"
        style={{ minWidth: '140px' }}
      >
        {t('edit_data_model', 'Edit data model')}
      </Button>
    );
  };

  return (
    <>
      <PageContentLayout>
        <PageContentLayout.Header>
          <DataModelHeader
            title={t('data_model_title', 'Data model')}
            schemas={getRemoteAndLocalSchemas(dataModelVersions || [])}
            draftSaved={isDirty && Object.keys(typeFieldErrors).length === 0}
            onSelectDataModelVersion={onSelectDataModelVersion}
            selectedDataModelVersion={
              mode === SchemaEditorMode.Edit
                ? localDraft!
                : selectedDataModelVersion
            }
          >
            {renderTools()}
          </DataModelHeader>
        </PageContentLayout.Header>
        <PageContentLayout.Body
          style={{ flexDirection: 'row', overflow: 'hidden' }}
        >
          {isInit ? (
            <SplitPanelLayout
              sidebar={
                <ErrorBoundary errorComponent={<ErrorPlaceholder />}>
                  <EditorPanel
                    editorMode={mode}
                    externalId={dataModelExternalId}
                    builtInTypes={builtInTypes}
                    graphQlSchema={graphQlSchema}
                    onSchemaChanged={onSchemaChanged}
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
                  />
                  <ErrorBoundary errorComponent={<ErrorPlaceholder />}>
                    <SchemaVisualizer
                      active={currentTypeName || undefined}
                      graphQLSchemaString={graphQlSchema}
                    />
                  </ErrorBoundary>
                </Flex>
              }
            />
          ) : (
            <Spinner />
          )}
        </PageContentLayout.Body>
      </PageContentLayout>

      {breakingChanges && (
        <BreakingChangesModal
          breakingChanges={breakingChanges}
          onCancel={() => setBreakingChanges('')}
          onUpdate={onSaveOrPublish}
          isUpdating={updating}
        />
      )}
    </>
  );
};
