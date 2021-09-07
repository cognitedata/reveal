import React from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { Colors, Title, Detail } from '@cognite/cogs.js';
import { Flex, DoughnutChart } from 'components/Common';
import {
  ApiStatusCount,
  useParsingJob,
} from 'modules/contextualization/pnidParsing';
import { useResourceCount, useInterval, useActiveWorkflow } from 'hooks';
import { pollJobResults } from 'modules/contextualization/pnidParsing/actions';
import { progressData } from 'components/Filters';
import StatusSquare from '../StatusSquare';

const SectionProgress = (): JSX.Element => {
  const dispatch = useDispatch();

  const { workflowId } = useActiveWorkflow();
  const { diagrams: total = 0 } = useResourceCount();

  const {
    statusCount: parsingJobStatusCount = {},
    status: parsingJobStatus,
    jobId,
  } = useParsingJob(workflowId);
  const progressCount = {
    completed: 0,
    running: 0,
    queued: 0,
    failed: 0,
    ...parsingJobStatusCount,
  };
  const isJobDone =
    parsingJobStatus === 'Completed' || parsingJobStatus === 'Failed';

  const pollJobIfRunning = () => {
    if (jobId && !isJobDone) {
      dispatch(pollJobResults.action({ jobId, workflowId }));
    }
  };

  useInterval(pollJobIfRunning, isJobDone ? null : 5000);

  const successPercentage = total
    ? Math.ceil((100 * progressCount.completed) / total)
    : 0;
  const idle =
    (total -
      (progressCount.completed +
        progressCount.running +
        progressCount.queued +
        progressCount.failed)) /
    total;

  const data = {
    labels: progressData.map((progress) => progress.label),
    datasets: [
      {
        label: 'test',
        data: progressData.map((progress) => {
          const statusProgress =
            progress.type === 'idle' ? idle : progressCount?.[progress.type];
          const progressPercentage =
            total === 0 ? 0 : 100 * ((statusProgress ?? 0) / total);
          return progressPercentage;
        }),
        backgroundColor: progressData.map((progress) => progress.color),
      },
    ],
  };

  return (
    <Wrapper>
      <DoughnutChart
        data={data}
        label={
          <Flex column align justify>
            <Title level={3} style={{ fontWeight: 700 }}>
              {successPercentage}%
            </Title>
            <Detail
              style={{
                textAlign: 'center',
                color: Colors['greyscale-grey6'].hex(),
              }}
            >
              processed successfully
            </Detail>
          </Flex>
        }
      />
      <Flex column justify style={{ alignItems: 'flex-start' }}>
        {progressData
          .filter((progress) => progress.type && progress.type !== 'idle')
          .map((progress) => (
            <StatusSquare
              key={`status-square-${progress.type}`}
              small
              status={progress.type}
              style={{ margin: '6px' }}
              hoverContent={`${
                progressCount?.[progress.type as keyof ApiStatusCount]
              } diagram(s) ${progress.type}`}
            />
          ))}
      </Flex>
    </Wrapper>
  );
};

export default React.memo(SectionProgress);

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 28px;
  margin: 0;
  font-family: 'Inter';
  min-width: 340px;
  max-width: 340px;
  border: 1px solid ${Colors['greyscale-grey4'].hex()};
  border-radius: 8px;
  box-sizing: border-box;
`;
