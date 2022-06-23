import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import React, { Suspense, useState, useEffect } from 'react';
import { SegmentedControl } from '@cognite/cogs.js';
import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { SchemaEditorMode } from '../../types';
import { UIEditor } from './UIEditor';
import { ErrorBoundary } from '@platypus-app/components/ErrorBoundary/ErrorBoundary';
import { BuiltInType } from '@platypus/platypus-core';
import { DataModelTypeDefsType } from '@platypus/platypus-core';
import { ErrorPlaceholder } from '../ErrorBoundary/ErrorPlaceholder';
import { useInjection } from '@platypus-app/hooks/useInjection';
import { TOKENS } from '@platypus-app/di';

const GraphqlCodeEditor = React.lazy(() =>
  import('../GraphqlCodeEditor/GraphqlCodeEditor').then((module) => ({
    default: module.GraphqlCodeEditor,
  }))
);

export interface EditorPanelProps {
  graphQlSchema: string;
  editorMode: SchemaEditorMode;
  builtInTypes: BuiltInType[];
  onSchemaChanged: (schemaString: string) => void;
  currentType: null | DataModelTypeDefsType;
  setCurrentType: (type: null | DataModelTypeDefsType) => void;
}

export const EditorPanel = (props: EditorPanelProps) => {
  const { t } = useTranslation('EditorPanel');
  const [builtInTypes, setBuiltInTypes] = useState<BuiltInType[]>([]);
  const dataModelTypeDefsBuilder = useInjection(
    TOKENS.dataModelTypeDefsBuilderService
  );

  useEffect(() => {
    async function getOptions() {
      const builtInTypesResponse =
        await dataModelTypeDefsBuilder.getBuiltinTypes();
      setBuiltInTypes(builtInTypesResponse);
    }

    // Load built in types only once, since they are not going to change
    getOptions();
  }, []);
  const [currentView, setCurrentView] = useState('ui');

  return (
    <div
      data-cy="editor_panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <PageToolbar title={t('editor_title', 'Editor')} titleLevel={6}>
        <SegmentedControl
          currentKey={currentView}
          onButtonClicked={setCurrentView}
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

      {currentView === 'code' ? (
        <Suspense fallback={<Spinner />}>
          <GraphqlCodeEditor
            builtInTypes={props.builtInTypes}
            code={props.graphQlSchema}
            onChange={props.onSchemaChanged}
            disabled={props.editorMode === SchemaEditorMode.View}
          />
        </Suspense>
      ) : (
        <ErrorBoundary errorComponent={<ErrorPlaceholder />}>
          <div style={{ flexGrow: 1, overflow: 'auto' }}>
            <UIEditor
              builtInTypes={builtInTypes}
              currentType={props.currentType}
              setCurrentType={props.setCurrentType}
              disabled={props.editorMode === SchemaEditorMode.View}
              graphQLSchemaString={props.graphQlSchema}
              onSchemaChange={(schemaString) =>
                props.onSchemaChanged(schemaString)
              }
            />
          </div>
        </ErrorBoundary>
      )}
    </div>
  );
};
