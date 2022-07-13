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
} from '@platypus/platypus-core';

import { DEFAULT_VERSION_PATH } from '@platypus-app/utils/config';
import { useSolution } from '../../hooks/useSolution';
import { SchemaEditorMode } from '../types';
import { BreakingChangesModal } from '../components/BreakingChangesModal';
import { EditorPanel } from '../components/EditorPanel';
import { DataModelHeader } from '../components/DataModelHeader';
import {
  PageToolbar,
  Size,
} from '@platypus-app/components/PageToolbar/PageToolbar';
import { SchemaVisualizer } from '@platypus-app/components/SchemaVisualizer/SchemaVisualizer';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { ErrorBoundary } from '@platypus-app/components/ErrorBoundary/ErrorBoundary';
import { ErrorPlaceholder } from '../components/ErrorBoundary/ErrorPlaceholder';
import { useLocalDraft } from '@platypus-app/modules/solution/data-model/hooks/useLocalDraft';
import { DiscardButton } from './elements';
import { useInjection } from '@platypus-app/hooks/useInjection';
import { queryClient } from '@platypus-app/queryClient';

export const DataModelPage = () => {
  const history = useHistory();

  const { t } = useTranslation('SolutionDataModel');
  const {
    currentTypeName,
    dataModel,
    dataModelVersions,
    graphQlSchema,
    isDirty,
    selectedVersion: selectedReduxSchema,
    typeFieldErrors,
  } = useSelector<DataModelState>((state) => state.dataModel);
  const [mode, setMode] = useState<SchemaEditorMode>(
    dataModelVersions.length ? SchemaEditorMode.View : SchemaEditorMode.Edit
  );
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [isInit, setInit] = useState(false);
  const [breakingChanges, setBreakingChanges] = useState('');
  const [builtInTypes, setBuiltInTypes] = useState<BuiltInType[]>([]);
  const [selectedSchema, setSelectedSchema] = useState(selectedReduxSchema);
  const dataModelTypeDefsBuilder = useInjection(
    TOKENS.dataModelTypeDefsBuilderService
  );
  const dataModelVersionHandler = useInjection(TOKENS.dataModelVersionHandler);
  const {
    insertSchema,
    updateSchema,
    selectVersion,
    setCurrentTypeName,
    setGraphQlSchema,
    setIsDirty,
  } = useSolution();
  const {
    setLocalDraft,
    removeLocalDraft,
    getRemoteAndLocalSchemas,
    getLocalDraft,
  } = useLocalDraft(dataModel!.id);

  const onSelectedSchemaChanged = (changedSchema: DataModelVersion) => {
    dataModelTypeDefsBuilder.clear();
    setGraphQlSchema(changedSchema.schema);
    setIsDirty(false);
    setCurrentTypeName(null);
    selectVersion(changedSchema.version);
    setSelectedSchema(changedSchema);
    setMode(
      changedSchema.status === DataModelVersionStatus.DRAFT
        ? SchemaEditorMode.Edit
        : SchemaEditorMode.View
    );
  };
  useEffect(() => {
    function fetchSchemaAndTypes() {
      const builtInTypesResponse = dataModelTypeDefsBuilder.getBuiltinTypes();
      setBuiltInTypes(builtInTypesResponse);
      dataModelTypeDefsBuilder.clear();
      setGraphQlSchema(selectedSchema.schema);
      setInit(true);
    }

    if (!isInit) {
      fetchSchemaAndTypes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSchema, isInit]);

  useEffect(() => {
    const draft = getLocalDraft(selectedReduxSchema.version);
    if (draft) {
      dataModelTypeDefsBuilder.clear();
      setSelectedSchema(draft);
      setGraphQlSchema(draft.schema);
      setMode(SchemaEditorMode.Edit);
    }
  }, []);
  const onSaveOrPublish = async () => {
    try {
      const publishNewVersion = breakingChanges || !dataModelVersions.length;
      let version = selectedSchema?.version;
      let result;

      if (publishNewVersion) {
        setUpdating(true);
        version = dataModelVersions.length
          ? (parseInt(selectedSchema?.version) + 1).toString()
          : '1';
        result = await dataModelVersionHandler.publish(
          {
            ...selectedSchema,
            externalId: dataModel!.id,
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
            ...selectedSchema,
            externalId: dataModel!.id,
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
        removeLocalDraft(selectedSchema);
        setIsDirty(false);

        updateSchema(result.getValue());
        setSelectedSchema(result.getValue());

        // react-query cache the requests and if we have to clear the cache when we are making changes
        // otherwise we will end with invalid state
        queryClient.clear();

        if (publishNewVersion) {
          insertSchema(result.getValue());
          history.replace(
            `/data-models/${dataModel?.id}/${DEFAULT_VERSION_PATH}/data`
          );
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
      setIsDirty(selectedSchema.schema !== schemaString);

      setLocalDraft({
        ...selectedSchema,
        schema: schemaString,
        status: DataModelVersionStatus.DRAFT,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedSchema]
  );

  const renderTools = () => {
    const draft = getLocalDraft(selectedSchema.version) || {
      ...selectedSchema,
      status: DataModelVersionStatus.DRAFT,
    };
    const onEditClick = () => {
      setLocalDraft(draft);
      setSelectedSchema(draft);
      setMode(SchemaEditorMode.Edit);
    };
    const onDiscardClick = () => {
      // if there is no published version yet, stay in edit mode
      if (dataModelVersions.length > 0) {
        setMode(SchemaEditorMode.View);
      }
      setIsDirty(false);
      removeLocalDraft(draft);
      dataModelTypeDefsBuilder.clear();
      setSelectedSchema(selectedReduxSchema);
      selectVersion('latest');
      setInit(false);
    };
    if (mode === SchemaEditorMode.Edit) {
      return (
        <div data-cy="data-model-toolbar-actions" style={{ display: 'flex' }}>
          {selectedSchema.status === DataModelVersionStatus.DRAFT && (
            <DiscardButton
              type="secondary"
              data-cy="discard-btn"
              disabled={saving || updating}
              onClick={onDiscardClick}
              style={{ marginRight: '10px' }}
            >
              {t('discard_changes', 'Discard changes')}
            </DiscardButton>
          )}

          <Button
            type="primary"
            data-cy="publish-schema-btn"
            onClick={() => {
              onSaveOrPublish();
            }}
            loading={saving || updating}
            disabled={
              (!isDirty &&
                selectedSchema.status !== DataModelVersionStatus.DRAFT) ||
              !graphQlSchema ||
              selectedReduxSchema.schema === graphQlSchema ||
              Object.keys(typeFieldErrors).length !== 0
            }
          >
            {t('publish', 'Publish')}
          </Button>
        </div>
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
            solutionId={dataModel!.id}
            editorMode={mode}
            schemas={getRemoteAndLocalSchemas(dataModelVersions)}
            draftSaved={isDirty && Object.keys(typeFieldErrors).length === 0}
            selectSchema={onSelectedSchemaChanged}
            selectedSchema={selectedSchema!}
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
