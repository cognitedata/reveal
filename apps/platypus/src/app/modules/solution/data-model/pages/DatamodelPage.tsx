import { useEffect, useState } from 'react';
import { GraphqlCodeEditor } from '../components/GraphqlCodeEditor/GraphqlCodeEditor';
import { PageContentLayout } from '@platypus-app/components/Layouts/PageContentLayout';
import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { SegmentedControl } from '@cognite/cogs.js';
import { Placeholder } from '@platypus-app/components/Placeholder/Placeholder';
import useSelector from '@platypus-app/hooks/useSelector';
import { SolutionState } from '@platypus-app/redux/reducers/global/solutionReducer';
import { SplitPanelLayout } from '@platypus-app/components/Layouts/SplitPanelLayout';

export const DatamodelPage = () => {
  const [projectSchema, setProjectSchema] = useState('');
  const [currentView, setCurrentView] = useState('code');
  const { t } = useTranslation('SolutionDataModel');
  const { selectedSchema } = useSelector<SolutionState>(
    (state) => state.solution
  );

  useEffect(() => {
    if (selectedSchema && selectedSchema!.schema) {
      setProjectSchema(selectedSchema!.schema);
    }
  }, [selectedSchema]);

  const renderHeader = () => {
    return <PageToolbar title={t('data_model_title', 'Data model')} />;
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
