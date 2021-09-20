import React, { useState } from 'react';
import { Title } from '@cognite/cogs.js';
import { trackUsage, PNID_METRICS } from 'utils/Metrics';
import { Flex, HugeButton, PageTitle } from 'components/Common';
import { useWorkflowCreateNew } from 'modules/workflows';
import { FileRequestFilter } from '@cognite/cdf-sdk-singleton';
import { useAnnotatedFiles } from 'hooks';
import { DiagramsSettingsBar } from 'containers';
import { Loading } from './components';
import FilesListEmpty from './FilesList/FilesListEmpty';
import FilesList from './FilesList';
import FilterBar from './FilterBar';

export default function LandingPage() {
  const [query, setQuery] = useState<string>('');
  const [filters, setFilter] = useState<FileRequestFilter>({});
  const [selectedDiagramsIds, setSelectedDiagramsIds] = useState<number[]>([]);
  const { createWorkflow } = useWorkflowCreateNew();
  const { annotatedFiles: files = [], isLoading } = useAnnotatedFiles(filters);

  const isFilterEmpty = !Object.keys(filters?.filter ?? {}).length;
  const areDiagramsSelected = Boolean(selectedDiagramsIds?.length);

  const onContextualizeNew = () => {
    trackUsage(PNID_METRICS.landingPage.startNew);
    createWorkflow();
  };

  const Header = () => (
    <div>
      <PageTitle title="Interactive Engineering Diagrams" />
      <Flex row style={{ margin: '32px 16px 56px 0' }}>
        <HugeButton type="primary" onClick={onContextualizeNew}>
          Create interactive diagrams
        </HugeButton>
      </Flex>
      <Title level={4}>Review and approve pending interactive diagrams</Title>
    </div>
  );

  if (isLoading) {
    return (
      <>
        <Header />
        <Loading />
      </>
    );
  }
  if (!files.length && isFilterEmpty) {
    return <FilesListEmpty />;
  }
  return (
    <>
      <Header />
      <FilterBar
        query={query}
        setQuery={setQuery}
        filters={filters}
        setFilters={setFilter}
      />
      <FilesList
        query={query}
        files={files}
        selectedDiagramsIds={selectedDiagramsIds}
        setSelectedDiagramsIds={setSelectedDiagramsIds}
      />
      {areDiagramsSelected && (
        <DiagramsSettingsBar
          selectedDiagramsIds={selectedDiagramsIds}
          buttons={['reject', 'approve', 'svgSave', 'recontextualize']}
          primarySetting="recontextualize"
        />
      )}
    </>
  );
}
