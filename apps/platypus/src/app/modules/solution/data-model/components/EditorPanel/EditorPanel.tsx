import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import React, { Suspense } from 'react';
import { SegmentedControl } from '@cognite/cogs.js';
import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { SchemaEditorMode } from '../../types';
import { UIEditor } from './UIEditor';
import { ErrorBoundary } from '../ErrorBoundary/ErrorBoundary';
const GraphqlCodeEditor = React.lazy(() =>
  import('../GraphqlCodeEditor/GraphqlCodeEditor').then((module) => ({
    default: module.GraphqlCodeEditor,
  }))
);

export interface EditorPanelProps {
  graphQlSchema: string;
  editorMode: SchemaEditorMode;
  currentView: string;
  onCurrentViewChanged: (view: string) => void;
  onSchemaChanged: (schemaString: string) => void;
}

export const EditorPanel = (props: EditorPanelProps) => {
  const { t } = useTranslation('EditorPanel');

  return (
    <div data-testid="code_editor" style={{ height: '100%' }}>
      <PageToolbar title={t('editor_title', 'Editor')} titleLevel={6}>
        <SegmentedControl
          currentKey={props.currentView}
          onButtonClicked={props.onCurrentViewChanged}
        >
          <SegmentedControl.Button
            key="code"
            icon="Code"
            aria-label="Code editor"
          />
          <SegmentedControl.Button
            key="ui"
            icon="DataTable"
            aria-label="UI editor"
          />
        </SegmentedControl>
      </PageToolbar>

      {props.currentView === 'code' ? (
        <Suspense fallback={<Spinner />}>
          <GraphqlCodeEditor
            code={props.graphQlSchema}
            onChange={props.onSchemaChanged}
            disabled={props.editorMode === SchemaEditorMode.View}
          />
        </Suspense>
      ) : (
        <ErrorBoundary>
          <UIEditor
            disabled={props.editorMode === SchemaEditorMode.View}
            graphQLSchemaString={props.graphQlSchema}
            onSchemaChange={(schemaString) =>
              props.onSchemaChanged(schemaString)
            }
          />
        </ErrorBoundary>
      )}
    </div>
  );
};
