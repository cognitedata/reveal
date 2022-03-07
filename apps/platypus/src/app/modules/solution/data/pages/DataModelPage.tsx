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

import { DEFAULT_VERSION_PATH } from '@platypus-app/utils/config';
import { ErrorType } from '@platypus-core/boundaries/types/platypus-error';
import { useSolution } from '../../hooks/useSolution';
import { SchemaEditorMode } from '../types';
import { BreakingChangesModal } from '../components/BreakingChangesModal';
import { CodeEditor } from '../components/CodeEditor';
import { DataModelHeader } from '../components/DataModelHeader';
import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { SchemaVisualizer } from '@platypus-app/components/SchemaVisualizer/SchemaVisualizer';

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
  const [currentView, setCurrentView] = useState('code');
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [breakingChanges, setBreakingChanges] = useState('');

  const { insertSchema, updateSchema } = useSolution();

  useEffect(() => {
    if (selectedSchema && selectedSchema!.schema) {
      setProjectSchema(selectedSchema!.schema);
      setIsDirty(false);
    }
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
        <div data-cy="data-model-toolbar-actions">
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
          <SplitPanelLayout
            sidebar={
              <CodeEditor
                currentView={currentView}
                editorMode={mode}
                graphQlSchema={projectSchema}
                onCurrentViewChanged={(view) => setCurrentView(view)}
                onSchemaChanged={onSchemaChanged}
              />
            }
            sidebarWidth={'40%'}
            sidebarMinWidth={400}
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
                <SchemaVisualizer graphQLSchemaString={projectSchema} />
              </Flex>
            }
          />
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
