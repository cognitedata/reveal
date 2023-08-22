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
    qualityScorePercentage,
    mappedPercentage,
    confidencePercentage,
    contextualizationScorePercentage,
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
          <PropertyInfo
            columnName={headerName}
            contextualizationScore={qualityScorePercentage}
          />
          <>
            <Body level={2}>Percentage filled:</Body>
            <ScoreComponent score={mappedPercentage} percentageText="" />
          </>
          <>
            <Body level={2}>Confidence:</Body>
            <ScoreComponent score={confidencePercentage} percentageText="" />
          </>
          <>
            <Body level={2}>Contextualization Score:</Body>
            <ScoreComponent
              score={contextualizationScorePercentage}
              percentageText=""
            />
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
