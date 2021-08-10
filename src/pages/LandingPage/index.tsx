import React, { useState } from 'react';
import { Title } from '@cognite/cogs.js';
import { trackUsage, PNID_METRICS } from 'utils/Metrics';
import { Flex, HugeButton, PageTitle } from 'components/Common';
import { useWorkflowCreateNew } from 'modules/workflows';
import { useAnnotatedFiles } from 'hooks';
import { Loading } from './components';
import FilesListEmpty from './FilesList/FilesListEmpty';
import { LoadMorePanel } from './FilterBar/LoadMorePanel';
import FilesList from './FilesList';
import FilterBar from './FilterBar';

export default function LandingPage() {
  const [shouldUpdate, setShouldUpdate] = useState(false);
  const [loadChunk, setLoadChunk] = useState<number>(0);
  const [query, setQuery] = useState<string>('');

  const { createWorkflow } = useWorkflowCreateNew();

  const { files, isLoading, total } = useAnnotatedFiles(
    shouldUpdate,
    loadChunk
  );
  const noFiles = !isLoading && total === 0;

  const onContextualizeNew = () => {
    trackUsage(PNID_METRICS.landingPage.startNew);
    createWorkflow();
  };

  return (
    <>
      <PageTitle>Interactive Engineering Diagrams</PageTitle>
      <Flex row style={{ margin: '32px 16px 56px 0' }}>
        <HugeButton type="primary" onClick={onContextualizeNew}>
          Create interactive diagrams
        </HugeButton>
      </Flex>
      <Title level={4}>Existing interactive diagrams pending approval</Title>
      <Flex row style={{ margin: '20px 0', justifyContent: 'space-between' }}>
        <FilterBar query={query} setQuery={setQuery} />
        <LoadMorePanel
          total={total}
          files={files}
          loadChunk={loadChunk}
          setLoadChunk={setLoadChunk}
        />
      </Flex>
      {isLoading && <Loading />}
      {noFiles && <FilesListEmpty />}
      {!isLoading && !noFiles && (
        <FilesList
          query={query}
          files={files}
          setShouldUpdate={setShouldUpdate}
        />
      )}
    </>
  );
}
