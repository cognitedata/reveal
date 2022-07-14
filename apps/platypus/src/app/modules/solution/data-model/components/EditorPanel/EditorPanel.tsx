import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import React, { Suspense, useState, useEffect } from 'react';
import { SegmentedControl } from '@cognite/cogs.js';
import {
  PageToolbar,
  Size,
} from '@platypus-app/components/PageToolbar/PageToolbar';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { SchemaEditorMode } from '../../types';
import { UIEditor } from './UIEditor';
import { ErrorBoundary } from '@platypus-app/components/ErrorBoundary/ErrorBoundary';
import { BuiltInType } from '@platypus/platypus-core';
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
  externalId: string;
  editorMode: SchemaEditorMode;
  builtInTypes: BuiltInType[];
  onSchemaChanged: (schemaString: string) => void;
  isPublishing: boolean;
}

export const EditorPanel = (props: EditorPanelProps) => {
  const { t } = useTranslation('EditorPanel');
  const [builtInTypes, setBuiltInTypes] = useState<BuiltInType[]>([]);
  const dataModelTypeDefsBuilder = useInjection(
    TOKENS.dataModelTypeDefsBuilderService
  );
  const dataModelVersionHandler = useInjection(TOKENS.dataModelVersionHandler);

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
      <PageToolbar title={t('editor_title', 'Editor')} size={Size.SMALL}>
        <SegmentedControl
          currentKey={currentView}
          onButtonClicked={setCurrentView}
          size="small"
        >
          <SegmentedControl.Button
            key="code"
            icon="Code"
            aria-label="Code editor"
          />
          <SegmentedControl.Button
            key="ui"
            icon="TableViewSmall"
            aria-label="UI editor"
          />
        </SegmentedControl>
      </PageToolbar>

      {currentView === 'code' ? (
        <Suspense fallback={<Spinner />}>
          <GraphqlCodeEditor
            builtInTypes={props.builtInTypes}
            dataModelVersionHandler={dataModelVersionHandler}
            externalId={props.externalId}
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
              disabled={
                props.editorMode === SchemaEditorMode.View || props.isPublishing
              }
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
