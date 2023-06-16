import styled from 'styled-components';

import { useTranslation } from '@transformations/common';
import { getJobStatusIcon } from '@transformations/components/panels/run-history/JobListItem';
import { TransformationRead } from '@transformations/types';

import { getDetailedTime, Timestamp } from '@cognite/cdf-utilities';
import { Body, Colors, Flex } from '@cognite/cogs.js';

type LastRunStatusProps = {
  lastFinishedJob: TransformationRead['lastFinishedJob'];
  runningJob: TransformationRead['runningJob'];
};

const LastRunStatus = ({
  lastFinishedJob,
  runningJob,
}: LastRunStatusProps): JSX.Element => {
  const { t } = useTranslation();
  const job = runningJob || lastFinishedJob;

  const getJobStatusPrefix = () => {
    switch (job?.status) {
      case 'Failed':
        return 'failed-colon';
      case 'Completed':
        return 'completed-colon';
      case 'Running':
      default:
        return null;
    }
  };

  const prefix = getJobStatusPrefix();

  if (!job) {
    return <Muted>{t('last-run-not-run-yet')}</Muted>;
  }

  return (
    <Flex gap={8} alignItems="center">
      {getJobStatusIcon(job?.status)}
      {['Failed', 'Completed'].includes(job?.status) && (
        <Timestamp
          timestamp={job?.finishedTime}
          {...(prefix
            ? {
                formatTooltip: (timestamp: number) =>
                  t(prefix, { time: getDetailedTime(timestamp) }),
              }
            : {})}
        />
      )}
    </Flex>
  );
};

export default LastRunStatus;

const Muted = styled(Body).attrs({ level: 2 })`
  color: ${Colors['text-icon--muted']};
`;
