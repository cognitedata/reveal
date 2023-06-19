import styled from 'styled-components';

import { useTranslation } from '@transformations/common';
import TabHeader from '@transformations/components/tab/TabHeader';
import { useGroupedJobMetrics } from '@transformations/hooks';
import { Status, Job } from '@transformations/types';
import {
  getHumanReadableJobSummary,
  getIconPropsFromJobStatus,
} from '@transformations/utils';

import { formatTime } from '@cognite/cdf-utilities';
import { Colors, Icon, IconType, SegmentedControl } from '@cognite/cogs.js';

export const getJobStatusColor = (status: Status): string => {
  switch (status) {
    case 'Created':
    case 'Running':
      return Colors['text-icon--status-neutral'];
    case 'Failed':
      return Colors['text-icon--status-critical'];
    case 'Completed':
      return Colors['text-icon--status-success'];
    default:
      return Colors['text-icon--status-warning'];
  }
};

export const getJobStatusIconType = (status: Status): IconType => {
  switch (status) {
    case 'Created':
    case 'Running':
      return 'Loader';
    case 'Failed':
      return 'WarningFilled';
    case 'Completed':
      return 'CheckmarkFilled';
    default:
      return 'Remove';
  }
};

export const getJobStatusIcon = (status: Status): JSX.Element => {
  return (
    <StyledJobStatusIcon
      $color={getJobStatusColor(status)}
      type={getJobStatusIconType(status)}
    />
  );
};

interface JobListItemProps {
  isExpanded?: boolean;
  job: Job;
  tabView?: string;
  updateTabView: (view: string) => void;
}

const JobListItem = ({
  isExpanded,
  job,
  updateTabView,
  tabView,
}: JobListItemProps) => {
  const { t } = useTranslation();

  const { data: groupedJobMetrics } = useGroupedJobMetrics(job.id);
  const summary: string[] = getHumanReadableJobSummary(groupedJobMetrics);

  const tabDetails = getIconPropsFromJobStatus(job.status);

  return (
    <TabHeader
      description={summary.join(' - ')}
      extra={
        isExpanded ? (
          <StyledSegmentedControlContainer onClick={(e) => e.stopPropagation()}>
            <SegmentedControl
              currentKey={tabView}
              size="small"
              onButtonClicked={(key) => updateTabView(key)}
            >
              <SegmentedControl.Button key="results">
                {t('results')}
              </SegmentedControl.Button>
              <SegmentedControl.Button key="sql">
                {t('sql')}
              </SegmentedControl.Button>
            </SegmentedControl>
          </StyledSegmentedControlContainer>
        ) : undefined
      }
      icon={tabDetails.icon}
      status={tabDetails.status}
      title={formatTime(
        job.finishedTime ?? job.startedTime ?? job.createdTime ?? 0
      )}
    />
  );
};

const StyledJobStatusIcon = styled(Icon)<{ $color: string }>`
  color: ${({ $color }) => $color};
`;

const StyledSegmentedControlContainer = styled.div`
  height: 18px;
  margin-top: -6px;
  margin-right: 32px;
`;

export default JobListItem;
