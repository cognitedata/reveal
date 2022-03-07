import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import React, { Suspense } from 'react';
import { SegmentedControl } from '@cognite/cogs.js';
import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { Placeholder } from '@platypus-app/components/Placeholder/Placeholder';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { useMemo } from 'react';
import { SchemaEditorMode } from '../../types';
const GraphqlCodeEditor = React.lazy(() =>
  import('../GraphqlCodeEditor/GraphqlCodeEditor').then((module) => ({
    default: module.GraphqlCodeEditor,
  }))
);


export interface CodeEditorProps {
  graphQlSchema: string;
  editorMode: SchemaEditorMode;
  currentView: string;
  onCurrentViewChanged: (view: string) => void;
  onSchemaChanged: (schemaString: string) => void;
}

export const CodeEditor = (props: CodeEditorProps) => {
  const { t } = useTranslation('CodeEditor');

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
            aria-label="Code view"
          />
          <SegmentedControl.Button
            key="ui"
            icon="DataTable"
            aria-label="UI view"
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
        <Placeholder
          componentName={t('ui_editor_title', 'UI editor')}
          componentDescription={t(
            'ui_editor_description',
            'It will help you build a data model even faster'
          )}
          showGraphic={false}
        />
      )}
    </div>
  );
};
