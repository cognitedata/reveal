import { Link } from 'react-router-dom';

import QueryStatusIcon from '@entity-matching-app/components/QueryStatusIcon';
import { createInternalLink } from '@entity-matching-app/utils';

import { Timestamp } from '@cognite/cdf-utilities';
import { Body, Flex } from '@cognite/cogs.js';

import { PipelineWithLatestRun } from '@entity-matching-app/hooks/entity-matching-pipelines';

type LatestRunCellProps = {
  latestRun?: PipelineWithLatestRun['latestRun'];
};

const LatestRunCell = ({ latestRun }: LatestRunCellProps): JSX.Element => {
  if (latestRun) {
    return (
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
    );
  }

  return <></>;
};

export default LatestRunCell;
