import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import React, { Suspense, useState } from 'react';
import { SegmentedControl } from '@cognite/cogs.js';
import {
  PageToolbar,
  Size,
} from '@platypus-app/components/PageToolbar/PageToolbar';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { SchemaEditorMode } from '../../types';
import { UIEditor } from './UIEditor';
import { ErrorBoundary } from '@platypus-app/components/ErrorBoundary/ErrorBoundary';
import { ErrorPlaceholder } from '../ErrorBoundary/ErrorPlaceholder';

import { useDataModelState } from '@platypus-app/modules/solution/hooks/useDataModelState';
import { DataModelState } from '@platypus-app/redux/reducers/global/dataModelReducer';
import useSelector from '@platypus-app/hooks/useSelector';
import { useDataModelVersions } from '@platypus-app/hooks/useDataModelActions';

const GraphqlCodeEditor = React.lazy(() =>
  import('../GraphqlCodeEditor/GraphqlCodeEditor').then((module) => ({
    default: module.GraphqlCodeEditor,
  }))
);

export interface EditorPanelProps {
  externalId: string;
  editorMode: SchemaEditorMode;
  isPublishing: boolean;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  externalId,
  editorMode,
  isPublishing,
}) => {
  const { t } = useTranslation('EditorPanel');
  const { data: dataModelVersionList } = useDataModelVersions(externalId);
  const [currentView, setCurrentView] = useState('ui');
  const { graphQlSchema, builtInTypes } = useSelector<DataModelState>(
    (state) => state.dataModel
  );

  const isUIDisabled = editorMode === SchemaEditorMode.View || isPublishing;
  const { setGraphQlSchema } = useDataModelState();

  return (
    <div
      data-cy="editor_panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
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
            key={`graphql-code-editor-version-${dataModelVersionList?.length}`}
            builtInTypes={builtInTypes}
            externalId={externalId}
            code={graphQlSchema}
            disabled={isUIDisabled}
            onChange={setGraphQlSchema}
          />
        </Suspense>
      ) : (
        <ErrorBoundary errorComponent={<ErrorPlaceholder />}>
          <div style={{ flexGrow: 1, overflow: 'auto' }}>
            <UIEditor builtInTypes={builtInTypes} disabled={isUIDisabled} />
          </div>
        </ErrorBoundary>
      )}
    </div>
  );
};
