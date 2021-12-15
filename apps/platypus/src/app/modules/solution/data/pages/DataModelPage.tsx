import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { PageContentLayout } from '@platypus-app/components/Layouts/PageContentLayout';
import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { Button, SegmentedControl } from '@cognite/cogs.js';
import { Placeholder } from '@platypus-app/components/Placeholder/Placeholder';
import useSelector from '@platypus-app/hooks/useSelector';
import { SolutionState } from '@platypus-app/redux/reducers/global/solutionReducer';
import { SplitPanelLayout } from '@platypus-app/components/Layouts/SplitPanelLayout';

import { SchemaVersionSelect } from '../../components/SchemaVersionSelect/SchemaVersionSelect';
import { GraphqlCodeEditor } from '../components/GraphqlCodeEditor/GraphqlCodeEditor';
import { SCHEMA_VERSION_LABEL } from '@platypus-app/utils/config';
import { StyledSchemaVersion } from './elements';

enum Mode {
  View,
  Edit,
}

export const DataModelPage = () => {
  const history = useHistory();
  const [mode, setMode] = useState<Mode>(Mode.View);
  const [projectSchema, setProjectSchema] = useState('');
  const [currentView, setCurrentView] = useState('code');
  const { t } = useTranslation('SolutionDataModel');
  const { solution, schemas, selectedSchema } = useSelector<SolutionState>(
    (state) => state.solution
  );

  useEffect(() => {
    if (selectedSchema && selectedSchema!.schema) {
      setProjectSchema(selectedSchema!.schema);
    }
  }, [selectedSchema]);

  const renderVersion = () => {
    if (schemas.length) {
      if (mode === Mode.View) {
        return (
          <SchemaVersionSelect
            selectedVersion={selectedSchema?.version}
            versions={schemas.map((s) => s.version)}
            onChange={(seletedValue) => {
              history.replace(
                `/solutions/${solution?.id}/${seletedValue}/data`
              );
            }}
          />
        );
      } else {
        return (
          <StyledSchemaVersion>
            {SCHEMA_VERSION_LABEL(selectedSchema?.version)}
          </StyledSchemaVersion>
        );
      }
    }
    return null;
  };

  const renderTools = () => {
    if (mode === Mode.Edit) {
      return (
        <>
          <Button
            type="ghost"
            onClick={() => {
              setProjectSchema(selectedSchema!.schema);
              setMode(Mode.View);
            }}
            style={{ marginRight: '10px' }}
          >
            Cancel
          </Button>
          <Button type="primary" onClick={() => setMode(Mode.Edit)}>
            Save
          </Button>
        </>
      );
    }
    if (selectedSchema && selectedSchema?.version === schemas[0].version) {
      return (
        <Button type="primary" onClick={() => setMode(Mode.Edit)}>
          Edit
        </Button>
      );
    }
    return null;
  };

  const renderHeader = () => {
    return (
      <PageToolbar
        title={t('data_model_title', 'Data model')}
        behindTitle={renderVersion()}
      >
        <PageToolbar.Tools>{renderTools()}</PageToolbar.Tools>
      </PageToolbar>
    );
  };

  const codeEditor = (
    <>
      <PageToolbar title={t('editor_title', 'Editor')} titleLevel={6}>
        <SegmentedControl
          currentKey={currentView}
          onButtonClicked={(key) => setCurrentView(key)}
        >
          <SegmentedControl.Button
            key="code"
            icon="Code"
            aria-label="Code view"
          />
          <SegmentedControl.Button key="ui" icon="Table" aria-label="UI view" />
        </SegmentedControl>
      </PageToolbar>
      {currentView === 'code' ? (
        <GraphqlCodeEditor
          code={projectSchema}
          onChange={(schemaString) => {
            setProjectSchema(schemaString);
          }}
          disabled={mode === Mode.View}
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
    </>
  );

  const schemaVisualization = (
    <>
      <PageToolbar title={t('preview_title', 'Preview')} titleLevel={6} />
      <Placeholder
        componentName={t('visualizer', 'Data model visualizer')}
        componentDescription={t(
          'visualizer_description',
          'It will provide you a better view on the data model built'
        )}
        showGraphic={false}
      />
    </>
  );
  return (
    <PageContentLayout>
      <PageContentLayout.Header>{renderHeader()}</PageContentLayout.Header>
      <PageContentLayout.Body
        style={{ flexDirection: 'row', overflow: 'hidden' }}
      >
        <SplitPanelLayout
          sidebar={codeEditor}
          sidebarWidth={'40%'}
          sidebarMinWidth={400}
          content={schemaVisualization}
        />
      </PageContentLayout.Body>
    </PageContentLayout>
  );
};
