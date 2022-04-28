import { useCallback, useEffect, useState } from 'react';
import { Prompt, useHistory } from 'react-router-dom';

import { PageContentLayout } from '@platypus-app/components/Layouts/PageContentLayout';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { Button, Flex } from '@cognite/cogs.js';
import useSelector from '@platypus-app/hooks/useSelector';
import { SolutionState } from '@platypus-app/redux/reducers/global/solutionReducer';
import { SplitPanelLayout } from '@platypus-app/components/Layouts/SplitPanelLayout';
import { Notification } from '@platypus-app/components/Notification/Notification';
import services from '@platypus-app/di';
import {
  SolutionDataModelType,
  ErrorType,
  BuiltInType,
} from '@platypus/platypus-core';

import { DEFAULT_VERSION_PATH } from '@platypus-app/utils/config';
import { useSolution } from '../../hooks/useSolution';
import { SchemaEditorMode } from '../types';
import { BreakingChangesModal } from '../components/BreakingChangesModal';
import { EditorPanel } from '../components/EditorPanel';
import { DataModelHeader } from '../components/DataModelHeader';
import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { SchemaVisualizer } from '@platypus-app/components/SchemaVisualizer/SchemaVisualizer';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import dataModelServices from '../di';
import { ErrorBoundary } from '../components/ErrorBoundary/ErrorBoundary';
const dataModelService = dataModelServices.solutionDataModelService;

export const DataModelPage = () => {
  const history = useHistory();

  const { t } = useTranslation('SolutionDataModel');
  const { solution, schemas, selectedSchema } = useSelector<SolutionState>(
    (state) => state.solution
  );
  const [mode, setMode] = useState<SchemaEditorMode>(
    schemas.length ? SchemaEditorMode.View : SchemaEditorMode.Edit
  );
  const [projectSchema, setProjectSchema] = useState('');
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isInit, setInit] = useState(false);
  const [breakingChanges, setBreakingChanges] = useState('');
  const [builtInTypes, setBuiltInTypes] = useState<BuiltInType[]>([]);
  const [currentType, setCurrentType] = useState<null | SolutionDataModelType>(
    null
  );
  const { insertSchema, updateSchema } = useSolution();

  useEffect(() => {
    async function fetchSchemaAndTypes() {
      const builtInTypesResponse =
        await dataModelService.getSupportedPrimitiveTypes();
      setBuiltInTypes(builtInTypesResponse);
      dataModelService.clear();
      setProjectSchema(selectedSchema!.schema);
      setIsDirty(false);
      setInit(true);
    }

    fetchSchemaAndTypes();
  }, [selectedSchema]);

  const onSaveOrPublish = async () => {
    try {
      const publishNewVersion = breakingChanges || !schemas.length;
      let result;
      if (publishNewVersion) {
        setUpdating(true);
        result = await services().solutionSchemaHandler.publish({
          solutionId: solution!.id,
          schema: projectSchema,
        });
        setBreakingChanges('');
      } else {
        setSaving(true);
        result = await services().solutionSchemaHandler.update({
          solutionId: solution!.id,
          schema: projectSchema,
          version: selectedSchema?.version,
        });
      }

      if ((result.error?.type as ErrorType) === 'BREAKING_CHANGE') {
        setBreakingChanges(result.error.message);
      } else if (result.error?.type as ErrorType) {
        Notification({
          type: 'error',
          message: result.error.message,
        });
      }

      if (result.isSuccess) {
        setIsDirty(false);

        updateSchema(result.getValue());

        if (publishNewVersion) {
          insertSchema(result.getValue());
          history.replace(
            `/solutions/${solution?.id}/${DEFAULT_VERSION_PATH}/data`
          );
        }
        Notification({
          type: 'success',
          message: t('schema_saved', 'Schema was succesfully saved.'),
        });
        // Must be located here for fetching versions correctly and updating schema version selector.
        //
        setMode(SchemaEditorMode.View);
      }
    } catch (error) {
      Notification({
        type: 'error',
        message: t(
          'schema_save_error',
          `Saving of the schema failed. ${error}`
        ),
      });
    }
    // Must be located here to work correctly with Promt.
    setUpdating(false);
    setSaving(false);
  };

  const onSchemaChanged = useCallback(
    (schemaString) => {
      setProjectSchema(schemaString);
      if (
        schemaString &&
        ((selectedSchema && selectedSchema.schema !== schemaString) ||
          !selectedSchema)
      ) {
        setIsDirty(true);
      } else if (selectedSchema && selectedSchema.schema === schemaString) {
        setIsDirty(false);
      }
    },
    [selectedSchema]
  );

  const renderTools = () => {
    if (mode === SchemaEditorMode.Edit) {
      return (
        <div data-cy="data-model-toolbar-actions" style={{ display: 'flex' }}>
          <Button
            type="secondary"
            data-cy="discard-btn"
            onClick={() => {
              setProjectSchema(
                selectedSchema && selectedSchema.schema
                  ? selectedSchema!.schema
                  : ''
              );
              setMode(SchemaEditorMode.View);
              setIsDirty(false);
              setCurrentType(null);
            }}
            style={{ marginRight: '10px' }}
          >
            {t('discard_changes', 'Discard changes')}
          </Button>

          <Button
            type="primary"
            data-cy="publish-schema-btn"
            onClick={() => onSaveOrPublish()}
            loading={saving}
            disabled={
              !isDirty ||
              !projectSchema ||
              (selectedSchema && selectedSchema?.schema === projectSchema)
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
        onClick={() => setMode(SchemaEditorMode.Edit)}
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
            solutionId={solution!.id}
            editorMode={mode}
            schemas={schemas}
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
                <ErrorBoundary>
                  <EditorPanel
                    currentType={currentType}
                    setCurrentType={setCurrentType}
                    editorMode={mode}
                    graphQlSchema={projectSchema}
                    builtInTypes={builtInTypes}
                    onSchemaChanged={onSchemaChanged}
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
                    titleLevel={6}
                  />
                  <ErrorBoundary>
                    <SchemaVisualizer
                      graphQLSchemaString={projectSchema}
                      active={currentType?.name}
                      config={{
                        knownTypes: builtInTypes,
                      }}
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
      <Prompt
        when={mode === SchemaEditorMode.Edit && isDirty}
        message={t(
          'unsaved_changes',
          'You have unsaved changes, are you sure you want to leave?'
        )}
      />
    </>
  );
};
