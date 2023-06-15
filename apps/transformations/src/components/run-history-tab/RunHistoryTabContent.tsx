import styled from 'styled-components';

import { JOB_DETAILS_REFETCH_INTERVAL_IN_MS } from '@transformations/common';
import InfoBox from '@transformations/components/info-box';
import { useJobDetails, useJobMetrics } from '@transformations/hooks';
import { Job, TransformationRead } from '@transformations/types';

import RunHistoryTabJobDetails from './RunHistoryTabJobDetails';

type RunHistoryTabContentProps = {
  finishedTime?: number;
  jobId: Job['id'];
  transformationId: TransformationRead['id'];
};

const RunHistoryTabContent = ({
  finishedTime,
  jobId,
  transformationId,
}: RunHistoryTabContentProps): JSX.Element => {
  const isRunning = !finishedTime;
  const hasBeenMoreThanAMinuteSinceFinished =
    finishedTime && new Date().getTime() - finishedTime > 60 * 1000;

  const { data: details } = useJobDetails(jobId, {
    refetchInterval: isRunning ? JOB_DETAILS_REFETCH_INTERVAL_IN_MS : 0,
  });
  useJobMetrics(jobId, {
    refetchInterval: !hasBeenMoreThanAMinuteSinceFinished
      ? JOB_DETAILS_REFETCH_INTERVAL_IN_MS
      : 0,
  });

  return (
    <StyledContainer>
      {details?.error && <InfoBox status="critical">{details.error}</InfoBox>}
      <RunHistoryTabJobDetails
        jobId={jobId}
        transformationId={transformationId}
      />
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 8px;
  overflow: auto;
`;

export default RunHistoryTabContent;
