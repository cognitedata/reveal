import React, { useState, useEffect } from 'react';
import { Title } from '@cognite/cogs.js';
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

type Props = {
  jobStarted: boolean;
};

export default function SectionResults(props: Props) {
  const { jobStarted } = props;
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
    <TitledSection
      useCustomPadding
      title={<TitleBar jobStarted={jobStarted} jobStatus={jobStatus} />}
    >
      <Flex column style={{ width: '100%' }}>
        {isJobDone && (
          <FilterBar
            selectionFilter={selectionFilter}
            setSelectionFilter={setSelectionFilter}
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

const TitleBar = (props: { jobStarted: boolean; jobStatus: JobStatus }) => {
  const { jobStarted, jobStatus } = props;
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
      {areResourcesLoading && <ResourcesLoaded jobStarted={jobStarted} />}
      {isJobDone && <DiagramActions />}
    </Flex>
  );
};
