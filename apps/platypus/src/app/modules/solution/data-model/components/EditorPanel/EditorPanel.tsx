/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { Suspense, useState } from 'react';

import { SegmentedControl } from '@cognite/cogs.js';

import { ErrorBoundary } from '../../../../../components/ErrorBoundary/ErrorBoundary';
import {
  PageToolbar,
  Size,
} from '../../../../../components/PageToolbar/PageToolbar';
import { Spinner } from '../../../../../components/Spinner/Spinner';
import { useUIEditorFeatureFlag } from '../../../../../flags';
import { useDataModelVersions } from '../../../../../hooks/useDataModelActions';
import useSelector from '../../../../../hooks/useSelector';
import { useTranslation } from '../../../../../hooks/useTranslation';
import { DataModelState } from '../../../../../redux/reducers/global/dataModelReducer';
import { useDataModelState } from '../../../hooks/useDataModelState';
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
  const { updateGraphQlSchema, setCurrentTypeName } = useDataModelState();

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
            onButtonClicked={(key) => {
              setCurrentView(key);

              // If you remove the current type from code and switch to UI
              // The UI will crash. This fixes that issue
              setCurrentTypeName(null);
            }}
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
            dataModelExternalId={externalId}
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
