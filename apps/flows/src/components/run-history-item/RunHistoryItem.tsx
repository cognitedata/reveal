import styled from 'styled-components';

import { useTranslation } from '@flows/common';
import TabHeader, { ColorStatus } from '@flows/components/tab-header/TabHeader';
import { WorkflowExecution } from '@flows/types/workflows';

import { formatTime } from '@cognite/cdf-utilities';
import { IconType, SegmentedControl } from '@cognite/cogs.js';

interface RunHistoryItemProps {
  isExpanded?: boolean;
  tabView?: string;
  updateTabView: (view: string) => void;
  execution: WorkflowExecution;
}

const getRunStatusIcon = (
  execution: WorkflowExecution
): { icon: IconType; status: ColorStatus } => {
  switch (execution.status) {
    case 'COMPLETED':
      return {
        icon: 'CheckmarkFilled',
        status: 'success',
      };
    case 'FAILED':
    case 'TERMINATED':
    case 'TIMED_OUT':
      return {
        icon: 'ErrorFilled',
        status: 'critical',
      };
    case 'PAUSED':
      return {
        icon: 'Pause',
        status: 'undefined',
      };
    case 'RUNNING':
      return {
        icon: 'Loader',
        status: 'neutral',
      };
    default:
      return {
        icon: 'InfoFilled',
        status: 'neutral',
      };
  }
};

const RunHistoryItem = ({
  isExpanded,
  updateTabView,
  tabView,
  execution,
}: RunHistoryItemProps) => {
  const { t } = useTranslation();

  const iconDetails = getRunStatusIcon(execution);

  return (
    <TabHeader
      description={`v${execution.version}`}
      extra={
        isExpanded ? (
          <StyledSegmentedControlContainer onClick={(e) => e.stopPropagation()}>
            <StyledSegmentedControl
              currentKey={tabView}
              size="small"
              onButtonClicked={(key) =>
                typeof key === 'string' ? updateTabView(key) : null
              }
            >
              <SegmentedControl.Button key="results">
                {t('results')}
              </SegmentedControl.Button>
              <SegmentedControl.Button key="sql">
                {t('definition')}
              </SegmentedControl.Button>
            </StyledSegmentedControl>
          </StyledSegmentedControlContainer>
        ) : undefined
      }
      icon={iconDetails.icon}
      status={iconDetails.status}
      title={
        execution.createdTime ? formatTime(execution.createdTime, true) : '-'
      }
    />
  );
};

const StyledSegmentedControl = styled(SegmentedControl)`
  margin-top: -3px;
  margin-right: 32px;
`;

const StyledSegmentedControlContainer = styled.div`
  height: 18px;
`;

export default RunHistoryItem;
