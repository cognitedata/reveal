import { ScoreComponent } from '@fusion/contextualization';

import { Body } from '@cognite/cogs.js';

import { JobStatus } from '../types';

import { FormattedContainer } from './FormattedContainer';
import { PropertyInfo } from './PropertyInfo';

export const InitialContextualizationScore = ({
  headerName,
  mappedPercentageJobStatus,
  qualityScorePercent = 0,
  percentageFilled = 0,
  contextualizationScorePercent = 0,
}: {
  headerName: string;
  mappedPercentageJobStatus: JobStatus;
  qualityScorePercent?: number;
  percentageFilled?: number;
  contextualizationScorePercent?: number;
}) => {
  const isLoadingPercentageFilled =
    mappedPercentageJobStatus === JobStatus.Queued ||
    mappedPercentageJobStatus === JobStatus.Running;

  const title = 'Current scores for Data Modeling column';
  const body = (
    <>
      <PropertyInfo
        columnName={headerName}
        contextualizationScore={qualityScorePercent}
      />
      <>
        <Body level={2}>Percentage filled:</Body>
        <ScoreComponent
          score={percentageFilled}
          percentageText=""
          isLoading={isLoadingPercentageFilled}
        />
      </>

      <>
        <Body level={2}>Contextualization Score:</Body>
        <ScoreComponent
          score={contextualizationScorePercent}
          percentageText=""
        />
      </>
    </>
  );
  const footer = <></>;
  return <FormattedContainer title={title} body={body} footer={footer} />;
};
