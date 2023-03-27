import { Timestamp } from '@cognite/cdf-utilities';
<<<<<<< HEAD
import { Body, Flex } from '@cognite/cogs.js';
=======
import { Body } from '@cognite/cogs.js';
>>>>>>> 3eb46f3 (feat: add latest run column to pipeline table)
import { Link } from 'react-router-dom';

import { PipelineWithLatestRun } from 'hooks/entity-matching-pipelines';
import { createInternalLink } from 'utils';
<<<<<<< HEAD
import QueryStatusIcon from 'components/QueryStatusIcon';
=======
>>>>>>> 3eb46f3 (feat: add latest run column to pipeline table)

type LatestRunCellProps = {
  latestRun?: PipelineWithLatestRun['latestRun'];
};

const LatestRunCell = ({ latestRun }: LatestRunCellProps): JSX.Element => {
  if (latestRun) {
    return (
<<<<<<< HEAD
      <Flex alignItems="center" gap={4}>
        <QueryStatusIcon status={latestRun.status} />
        <Body level={2} strong>
          <Link
            to={createInternalLink(
              `pipeline/${latestRun.pipelineId}/results/${latestRun.jobId}`
            )}
          >
            <Timestamp timestamp={latestRun.createdTime} />
          </Link>
        </Body>
      </Flex>
=======
      <Body level={2} strong>
        <Link
          to={createInternalLink(`pipeline/${latestRun?.pipelineId}/results`)}
        >
          <Timestamp timestamp={latestRun?.createdTime} />
        </Link>
      </Body>
>>>>>>> 3eb46f3 (feat: add latest run column to pipeline table)
    );
  }

  return <></>;
};

export default LatestRunCell;
