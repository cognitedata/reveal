import {
  JobStatus,
  ScoreComponent,
  useEstimateQuality,
} from '@fusion/contextualization';

import { Body, Chip, Icon } from '@cognite/cogs.js';

import { FormattedContainer } from './FormattedContainer';
import { Spinner } from './Spinner/Spinner';

export const InitialContextualizationScore = ({
  headerName,
  advancedJoin,
}: {
  headerName: string;
  advancedJoin: any;
}) => {
  const {
    externalId = undefined,
    matchers: [
      {
        dbName = undefined,
        tableName = undefined,
        fromColumnKey = undefined,
        toColumnKey = undefined,
      } = {},
    ] = [],
  } = advancedJoin || {};

  const {
    estimateQualityJobStatus: status,
    contextualizationScorePercent,
    estimatedCorrectnessScorePercent,
    confidencePercent,
  } = useEstimateQuality(
    externalId,
    dbName,
    tableName,
    fromColumnKey,
    toColumnKey
  );

  const title = (
    <div>
      Current scores for column: &nbsp;
      <Chip icon="Link" hideTooltip={true} label={headerName} />
    </div>
  );
  const body =
    status === JobStatus.Queued || status === JobStatus.Running ? (
      <Spinner />
    ) : status === JobStatus.Completed ? (
      <>
        <>
          <Body level={2}>Contextualization score:</Body>
          <ScoreComponent
            score={contextualizationScorePercent}
            percentageText=""
          />
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
    ) : (
      <>
        <Icon type="Error" />
      </>
    );
  const footer = <></>;
  return <FormattedContainer title={title} body={body} footer={footer} />;
};
