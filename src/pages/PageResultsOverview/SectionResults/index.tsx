import React, { useContext, useState, useEffect } from 'react';
import { Title } from '@cognite/cogs.js';
import { AppStateContext } from 'context';
import { Flex, TitledSection } from 'components/Common';
import { useActiveWorkflow } from 'hooks';
import { useWorkflowTotalCounts } from 'modules/workflows';
import {
  useJobStatus,
  useParsingJob,
  JobStatus,
} from 'modules/contextualization/pnidParsing';
import ResultsTable from './ResultsTable';
import ResultsTableEmpty from './ResultsTableEmpty';
import ResourcesLoaded from './ResourcesLoaded';
import DiagramActions from './DiagramActions';
import FilterBar from './FilterBar';
import { SelectionFilter } from './types';

export default function SectionResults() {
  const { jobStarted } = useContext(AppStateContext);
  const [selectionFilter, setSelectionFilter] = useState<SelectionFilter>({});
  const [showResults, setShowResults] = useState(false);
  const { workflowId } = useActiveWorkflow();

  const jobStatus = useJobStatus(workflowId, jobStarted);
  const parsingJob = useParsingJob(workflowId);

  const isJobDone = jobStatus === 'done' || parsingJob?.status === 'Completed';
  const shouldShowTable =
    parsingJob?.status === 'Queued' ||
    parsingJob?.status === 'Running' ||
    parsingJob?.status === 'Collecting' ||
    parsingJob?.status === 'Completed' ||
    parsingJob?.annotationCounts;

  useEffect(() => {
    if (shouldShowTable) setShowResults(true);
    else setShowResults(false);
  }, [parsingJob, shouldShowTable]);

  return (
    <TitledSection useCustomPadding title={<TitleBar jobStatus={jobStatus} />}>
      <Flex column style={{ width: '100%' }}>
        {shouldShowTable && (
          <FilterBar
            selectionFilter={selectionFilter}
            setSelectionFilter={setSelectionFilter}
            showLoadingSkeleton={!isJobDone}
          />
        )}
        {showResults && (
          <ResultsTable
            selectionFilter={selectionFilter}
            showLoadingSkeleton={!isJobDone}
          />
        )}
        {!showResults && <ResultsTableEmpty />}
      </Flex>
    </TitledSection>
  );
}

const TitleBar = ({ jobStatus }: { jobStatus: JobStatus }) => {
  const { workflowId } = useActiveWorkflow();
  const { diagrams } = useWorkflowTotalCounts(workflowId);
  const areResourcesLoading = jobStatus !== 'ready' && jobStatus !== 'done';
  const isJobDone = jobStatus === 'done';

  return (
    <Flex row align style={{ width: '100%', justifyContent: 'space-between' }}>
      <Title level={5} style={{ margin: '16px' }}>
        Results preview{' '}
        <span style={{ fontWeight: 'lighter', color: '#8C8C8C' }}>
          {diagrams}
        </span>
      </Title>
      {areResourcesLoading && <ResourcesLoaded />}
      {isJobDone && <DiagramActions />}
    </Flex>
  );
};
