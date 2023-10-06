/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { Suspense, useState } from 'react';

import { ErrorBoundary } from '@platypus-app/components/ErrorBoundary/ErrorBoundary';
import {
  PageToolbar,
  Size,
} from '@platypus-app/components/PageToolbar/PageToolbar';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { useUIEditorFeatureFlag } from '@platypus-app/flags';
import { useDataModelVersions } from '@platypus-app/hooks/useDataModelActions';
import useSelector from '@platypus-app/hooks/useSelector';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { useDataModelState } from '@platypus-app/modules/solution/hooks/useDataModelState';
import { DataModelState } from '@platypus-app/redux/reducers/global/dataModelReducer';

import { SegmentedControl } from '@cognite/cogs.js';

import { SchemaEditorMode } from '../../types';
import { ErrorPlaceholder } from '../ErrorBoundary/ErrorPlaceholder';
import { ErrorsByGroup } from '../GraphqlCodeEditor/Model';

import { UIEditor } from './UIEditor';

const GraphqlCodeEditor = React.lazy(() =>
  import('../GraphqlCodeEditor/GraphqlCodeEditor').then((module) => ({
    default: module.GraphqlCodeEditor,
  }))
);

export interface EditorPanelProps {
  externalId: string;
  editorMode: SchemaEditorMode;
  isPublishing: boolean;
  errorsByGroup: ErrorsByGroup;
  setErrorsByGroup: (errors: ErrorsByGroup) => void;
  setEditorHasError: (hasError: boolean) => void;
  space: string;
  version: string;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  externalId,
  editorMode,
  space,
  isPublishing,
  errorsByGroup,
  setErrorsByGroup,
  setEditorHasError,
}) => {
  const { t } = useTranslation('EditorPanel');
  const { isEnabled: isUIEditorFlagEnabled } = useUIEditorFeatureFlag();

  // for fdm v3 users, only show the ui editor if the feature toggle is on.
  const isUIEditorVisible = isUIEditorFlagEnabled;

  const [currentView, setCurrentView] = useState(
    isUIEditorVisible ? 'ui' : 'code'
  );

  const { data: dataModelVersionList } = useDataModelVersions(
    externalId,
    space
  );
  const { graphQlSchema, currentTypeName, typeDefs } =
    useSelector<DataModelState>((state) => state.dataModel);

  const isUIDisabled = editorMode === SchemaEditorMode.View || isPublishing;
  const { updateGraphQlSchema } = useDataModelState();

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
        {isUIEditorVisible && (
          <SegmentedControl
            currentKey={currentView}
            onButtonClicked={setCurrentView}
            size="small"
          >
            <SegmentedControl.Button
              key="code"
              icon="Code"
              aria-label="Code editor"
              data-cy="code-editor-tab-btn"
            />
            <SegmentedControl.Button
              key="ui"
              icon="TableViewSmall"
              aria-label="UI editor"
              data-cy="ui-editor-tab-btn"
            />
          </SegmentedControl>
        )}
      </PageToolbar>

      {currentView === 'code' ? (
        <Suspense fallback={<Spinner />}>
          <GraphqlCodeEditor
            key={`graphql-code-editor-version-${dataModelVersionList?.length}`}
            space={space}
            currentTypeName={currentTypeName || undefined}
            typeDefs={typeDefs}
            code={graphQlSchema}
            disabled={isUIDisabled}
            onChange={updateGraphQlSchema}
            errorsByGroup={errorsByGroup}
            setErrorsByGroup={setErrorsByGroup}
            setEditorHasError={setEditorHasError}
          />
        </Suspense>
      ) : (
        <ErrorBoundary errorComponent={<ErrorPlaceholder />}>
          <div style={{ flexGrow: 1, overflow: 'auto' }}>
            <UIEditor disabled={isUIDisabled} />
          </div>
        </ErrorBoundary>
      )}
    </div>
  );
};