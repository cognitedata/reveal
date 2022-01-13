import { SegmentedControl } from '@cognite/cogs.js';
import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { Placeholder } from '@platypus-app/components/Placeholder/Placeholder';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { SchemaEditorMode } from '../../types';
import { GraphqlCodeEditor } from '../GraphqlCodeEditor/GraphqlCodeEditor';

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
        <GraphqlCodeEditor
          code={props.graphQlSchema}
          onChange={(schemaString) => props.onSchemaChanged(schemaString)}
          disabled={props.editorMode === SchemaEditorMode.View}
        />
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
