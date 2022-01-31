import React, { useState } from 'react';
import { Button, Title } from '@cognite/cogs.js';
import { trackUsage, PNID_METRICS } from 'utils/Metrics';
import { Flex, PageTitle } from 'components/Common';
import { useWorkflowCreateNew } from 'modules/workflows';
import { FileRequestFilter } from '@cognite/sdk';
import { useAnnotatedFiles } from 'hooks';
import { DiagramsSettingsBar } from 'containers';
import { Loading, TitleRow } from './components';
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
  const onSelectionClose = () => {
    setSelectedDiagramsIds([]);
  };

  const Header = () => (
    <Flex column>
      <TitleRow align>
        <PageTitle title="Interactive Engineering Diagrams" />
        <Button type="primary" onClick={onContextualizeNew}>
          Create interactive diagrams
        </Button>
      </TitleRow>
      <Title level={4}>Diagrams pending approval</Title>
    </Flex>
  );

  if (isLoading) {
    return (
      <Flex column style={{ padding: '16px 16px 0 16px' }}>
        <Header />
        <Loading />
      </Flex>
    );
  }
  if (!files.length && isFilterEmpty) {
    return (
      <Flex column style={{ padding: '16px 16px 0 16px' }}>
        <FilesListEmpty />
      </Flex>
    );
  }
  return (
    <Flex column style={{ padding: '16px 16px 0 16px' }}>
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
          onClose={onSelectionClose}
          marginBottom={16}
        />
      )}
    </Flex>
  );
}
