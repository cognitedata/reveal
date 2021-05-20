import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Progress } from 'antd';
import { Body, Icon } from '@cognite/cogs.js';
import { Popover, Flex, TitledSection } from 'components/Common';
import { getActiveWorkflowId, useWorkflowResources } from 'modules/workflows';
import { ResourceEntriesType } from 'modules/types';
import LoadingProgress from 'components/LoadingProgress';
import { useParsingJob } from 'modules/contextualization/pnidParsing/hooks';
import useInterval from 'hooks/useInterval';
import { pollJobResults } from 'modules/contextualization/pnidParsing/actions';

const ProgressBarSection = (): JSX.Element => {
  const dispatch = useDispatch();

  const workflowId = useSelector(getActiveWorkflowId);

  const { statusCount, status: parsingJobStatus, jobId } = useParsingJob(
    workflowId
  );
  const isJobDone =
    parsingJobStatus === 'Completed' || parsingJobStatus === 'Failed';

  useInterval(
    () => {
      if (jobId && !isJobDone) {
        dispatch(pollJobResults.action({ jobId, workflowId }));
      }
    },
    isJobDone ? null : 5000
  );
  const { completed = 0, running = 0, queued = 0 } = statusCount ?? {};
  const total = running + completed + queued;

  const parsingJobPercent: number = Math.round((completed / total) * 100);

  const FilesStatusCounts = () => (
    <span>
      <Body level={2}>
        <Icon type="Checkmark" /> Completed: {completed}
      </Body>
      <Body level={2}>
        <Icon type="Loading" /> Running: {running}
      </Body>
      <Body level={2}>
        <Icon type="Schedule" /> Queued: {queued}
      </Body>
    </span>
  );

  return (
    <TitledSection title="Progress">
      <LoadingProgress type="diagrams" label="Diagrams" />
      <MappedLoadProgressBars />
      <Flex column style={{ width: '100%', margin: '4px 0' }}>
        <Body level={2} strong>
          <Popover content={<FilesStatusCounts />}>
            Matching tags in diagrams to targets ({completed}/{total})
          </Popover>
        </Body>
        <Progress
          percent={parsingJobPercent}
          status={parsingJobPercent === 100 ? 'success' : 'active'}
        />
      </Flex>
    </TitledSection>
  );
};

const MappedLoadProgressBars = (): JSX.Element => {
  const workflowId = useSelector(getActiveWorkflowId);
  const workflowResources = useWorkflowResources(workflowId, true);
  const workflowResourcesEntries = Object.entries(
    workflowResources
  ) as ResourceEntriesType[];

  return (
    <Flex row style={{ flexGrow: 1 }}>
      {workflowResourcesEntries
        .filter(
          (workflowResource: ResourceEntriesType) => workflowResource[1]?.length
        )
        .map((workflowResource: ResourceEntriesType) => {
          const type = workflowResource[0];
          const label = `${type.substring(0, 1).toUpperCase()}${type.substring(
            1
          )}`;
          return (
            <Flex column style={{ width: '100%' }}>
              <LoadingProgress type={type} label={label} />
            </Flex>
          );
        })}
    </Flex>
  );
};

export default React.memo(ProgressBarSection);
