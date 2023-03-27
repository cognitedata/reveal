import { Timestamp } from '@cognite/cdf-utilities';
import { Body } from '@cognite/cogs.js';
import { Link } from 'react-router-dom';

import { PipelineWithLatestRun } from 'hooks/entity-matching-pipelines';
import { createInternalLink } from 'utils';

type LatestRunCellProps = {
  latestRun?: PipelineWithLatestRun['latestRun'];
};

const LatestRunCell = ({ latestRun }: LatestRunCellProps): JSX.Element => {
  if (latestRun) {
    return (
      <Body level={2} strong>
        <Link
          to={createInternalLink(`pipeline/${latestRun?.pipelineId}/results`)}
        >
          <Timestamp timestamp={latestRun?.createdTime} />
        </Link>
      </Body>
    );
  }

  return <></>;
};

export default LatestRunCell;
