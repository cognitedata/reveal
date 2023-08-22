import styled from 'styled-components';

import { ScoreComponent, getUrlParameters } from '@fusion/contextualization';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';

import { Body, Icon } from '@cognite/cogs.js';

import { EstimateArray, EstimateJobPercentages, JobStatus } from '../types';

import { PropertyInfo } from './PropertyInfo';

export const EstimatedScoreBody = ({
  savedManualMatchesCount,
  jobState,
  estimateArray,
}: {
  savedManualMatchesCount: number;
  jobState: JobStatus | undefined;
  headerName: string;
  estimateArray: EstimateArray | undefined;
}) => {
  const { headerName } = getUrlParameters();

  if (savedManualMatchesCount === 0 || !estimateArray) {
    return <EmptyPanel>Estimated score will appear here</EmptyPanel>;
  }
  const {
    contextualizationScorePercent,
    estimatedCorrectnessScorePercent,
    confidencePercent,
  } = estimateArray.jobResponse as EstimateJobPercentages;
  switch (jobState) {
    case JobStatus.Failed:
      return (
        <>
          <Icon type="Error" />
        </>
      );
    case JobStatus.Completed:
      return (
        <>
          <>
            <Body level={2}>Contextualization score:</Body>
            <ScoreComponent score={contextualizationScorePercent} percentageText="" />
          </>
          <>
            <Body level={2}>Estimated correctness:</Body>
            <ScoreComponent
              score={estimatedCorrectnessScorePercent}
              percentageText=""
            />
          </>
          <>
            <Body level={2}>Confidence:</Body>
            <ScoreComponent score={confidencePercent} percentageText="" />
          </>
        </>
      );

    case JobStatus.Running:
    case JobStatus.Queued:
    default:
      return (
        <>
          <Spinner />
        </>
      );
  }
};

const EmptyPanel = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background-color: #fafafa;
`;
