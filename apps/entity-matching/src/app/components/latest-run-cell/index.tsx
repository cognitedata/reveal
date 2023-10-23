import { Link } from 'react-router-dom';

import { Timestamp } from '@cognite/cdf-utilities';
import { Body, Flex } from '@cognite/cogs.js';

import { Pipeline } from '../../hooks/entity-matching-pipelines';
import { createInternalLink } from '../../utils';
import QueryStatusIcon from '../QueryStatusIcon';

type LatestRunCellProps = Pick<Pipeline, 'id' | 'lastRun'>;

const LatestRunCell = ({ id, lastRun }: LatestRunCellProps): JSX.Element => {
  if (lastRun) {
    return (
      <Flex alignItems="center" gap={4}>
        <QueryStatusIcon status={lastRun.status} />
        <Body level={2} strong>
          <Link
            to={createInternalLink(`pipeline/${id}/results/${lastRun.jobId}`)}
          >
            <Timestamp timestamp={lastRun.createdTime} />
          </Link>
        </Body>
      </Flex>
    );
  }

  return <></>;
};

export default LatestRunCell;
