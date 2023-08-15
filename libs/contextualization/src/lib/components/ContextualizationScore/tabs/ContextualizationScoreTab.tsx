import { Chip } from '@cognite/cogs.js';

import { JobStatus } from '../../../types';

import { ImproveYourScore } from './ImproveYourScore';
import { PercentageChip } from './PercentageChip';

export const ContextualizationScoreTab = ({
  headerName,
  dataModelType,
  mappedPercentageJobStatus,
  estimatedCorrectness = '?',
  percentageFilled = '?',
  contextualizationScore = '?',
}: {
  headerName: string;
  dataModelType: string;
  mappedPercentageJobStatus: JobStatus;
  estimatedCorrectness?: string;
  percentageFilled?: string;
  contextualizationScore?: string;
}) => {
  return (
    <div data-testid="ContextScore-tab">
      <span>
        <Chip
          hideTooltip={true}
          size="small"
          label="Estimated Correctness"
          type="neutral"
        />
        :{' '}
        <Chip
          hideTooltip={true}
          size="small"
          label={`${estimatedCorrectness} %`}
        />
        <br />
        <br />
      </span>
      <span>
        <Chip
          hideTooltip={true}
          size="small"
          label="Percentage filled"
          type="neutral"
        />
        :{' '}
        <PercentageChip
          value={+percentageFilled}
          status={mappedPercentageJobStatus}
        />
        <br />
        <br />
        <Chip
          hideTooltip={true}
          size="small"
          label="Contextualization score"
          type="neutral"
        />
        :{' '}
        <Chip
          hideTooltip={true}
          size="small"
          label={`${contextualizationScore} %`}
        />
        <br />
        <br />
      </span>
      <br />
      <ImproveYourScore headerName={headerName} dataModelType={dataModelType} />
      <br />
    </div>
  );
};
