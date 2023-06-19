import styled from 'styled-components';

import { useGroupedJobMetrics } from '@transformations/hooks';
import { Job } from '@transformations/types';
import { getHumanReadableJobSummary } from '@transformations/utils';

import { formatTime } from '@cognite/cdf-utilities';
import { Colors, Body, IconType, Icon, Flex } from '@cognite/cogs.js';

type RecentRunItemTooltipContentProps = {
  job: Job;
};

const getRecentRunItemTooltipIcon = (
  status: Job['status']
): {
  iconType: IconType;
  colorType: 'critical' | 'success';
} => {
  switch (status) {
    case 'Failed':
      return {
        iconType: 'WarningFilled',
        colorType: 'critical',
      };
    default:
      return {
        iconType: 'CheckmarkFilled',
        colorType: 'success',
      };
  }
};

const RecentRunItemTooltipContent = ({
  job,
}: RecentRunItemTooltipContentProps): JSX.Element => {
  const { data: groupedJobMetrics } = useGroupedJobMetrics(job.id);
  const summary: string[] = getHumanReadableJobSummary(groupedJobMetrics);
  const { iconType, colorType } = getRecentRunItemTooltipIcon(job.status);

  return (
    <StyledTooltipContent direction="column" gap={8}>
      <Flex alignItems="center" gap={8}>
        <Icon
          type={iconType}
          css={{ color: Colors[`text-icon--status-${colorType}`] }}
        />
        <Body level={3} strong>
          {formatTime(
            job.finishedTime ?? job.startedTime ?? job.createdTime ?? 0
          )}
        </Body>
      </Flex>
      {summary.length > 0 &&
        summary.map((text) => (
          <StyledTooltipBody key={text} level={3}>
            {text}
          </StyledTooltipBody>
        ))}
    </StyledTooltipContent>
  );
};

const StyledTooltipContent = styled(Flex)`
  padding: 16px;
`;

const StyledTooltipBody = styled(Body)`
  color: var(--cogs-text-icon--muted);
`;

export default RecentRunItemTooltipContent;
