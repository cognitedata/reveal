import { Handle, NodeProps, Position } from 'reactflow';

import styled from 'styled-components';

import { useTranslation } from '@flows/common';
import { ColorStatus } from '@flows/components/tab-header/TabHeader';
import { useWorkflowBuilderContext } from '@flows/contexts/WorkflowContext';
import { useWorkflowExecutionDetails } from '@flows/hooks/workflows';
import { PROCESS_ICON, ProcessNodeData } from '@flows/types';

import {
  Body,
  Colors,
  Elevations,
  Flex,
  Icon,
  IconType,
  Overline,
} from '@cognite/cogs.js';

const BASE_NODE_HANDLE_SIZE = 16;

export const RunNodeRenderer = ({
  data,
}: NodeProps<ProcessNodeData>): JSX.Element => {
  const { t } = useTranslation();

  const { selectedExecution } = useWorkflowBuilderContext();

  const { data: executionDetails } = useWorkflowExecutionDetails(
    selectedExecution?.id!,
    {
      enabled: !!selectedExecution?.id,
    }
  );

  useWorkflowExecutionDetails(selectedExecution?.id!, {
    enabled: !!selectedExecution?.id,
    refetchInterval: !executionDetails?.endTime ? 3000 : 0,
  });

  const task = executionDetails?.executedTasks?.find(
    ({ externalId }) => externalId === data.processExternalId
  );

  let status: ColorStatus = 'undefined';
  let icon: IconType = 'Remove';

  switch (task?.status) {
    case 'CANCELED':
    case 'FAILED':
    case 'FAILED_WITH_TERMINAL_ERROR':
    case 'SKIPPED':
    case 'TIMED_OUT':
      status = 'critical';
      icon = 'ErrorFilled';
      break;
    case 'IN_PROGRESS':
      status = 'neutral';
      icon = 'Loader';
      break;
    case 'COMPLETED':
    case 'COMPLETED_WITH_ERRORS':
      status = 'success';
      icon = 'CheckmarkFilled';
      break;
    case 'SCHEDULED':
    default:
      status = 'undefined';
      icon = 'Remove';
      break;
  }

  return (
    <RunNodeContainer $status={status}>
      <RunNodeContent>
        <BaseHandleLeft position={Position.Left} type="target" />
        <BaseHandleRight position={Position.Right} type="source" />
        <Flex gap={8}>
          <RunNodeIconContainer $status={status}>
            <RunNodeIcon
              $status={status}
              type={PROCESS_ICON[data.processType]}
            />
          </RunNodeIconContainer>
          <Flex direction="column" style={{ flex: 1, overflow: 'auto' }}>
            <RunNodeTitle $status={status} level={3}>
              {t(`component-title-${data.processType}`, {
                postProcess: 'uppercase',
              })}
            </RunNodeTitle>
            {data.processExternalId ? (
              <Body level={3}>{data.processExternalId}</Body>
            ) : (
              <Body level={3} muted>
                {t('not-set')}
              </Body>
            )}
          </Flex>
          <Flex alignItems="center">
            <Icon
              type={icon}
              css={{ color: Colors[`text-icon--status-${status}`] }}
            />
          </Flex>
        </Flex>
      </RunNodeContent>
    </RunNodeContainer>
  );
};

const BaseHandle = styled(Handle)`
  background-color: white;
  border: none;
  height: ${BASE_NODE_HANDLE_SIZE}px;
  width: ${BASE_NODE_HANDLE_SIZE / 2}px;
  right: ${(BASE_NODE_HANDLE_SIZE / 2) * -1}px;
  right: 0px;
  opacity: 0;
  z-index: 1;
`;

const BaseHandleRight = styled(BaseHandle)`
  right: 0px;
`;

const BaseHandleLeft = styled(BaseHandle)`
  left: 0px;
`;

const RunNodeContent = styled.div`
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 8px;
`;

const RunNodeContainer = styled.div<{ $status?: ColorStatus }>`
  background-color: ${({ $status }) =>
    Colors[`surface--status-${$status}--muted--default`]};
  background-color: ${Colors['surface--muted']};
  border-left: 6px solid
    ${({ $status }) => Colors[`border--status-${$status}--strong`]};
  border-radius: 6px;
  box-shadow: ${Elevations['elevation--surface--interactive']};
  display: flex;
  flex-direction: column;
  width: 300px;

  ::before {
    background-color: ${Colors['decorative--grayscale--white']};
    content: '';
    width: 100%;
    height: 54px;
    position: absolute;
    z-index: -1;
    left: 0;
    border-radius: 6px;
  }
`;

const RunNodeIconContainer = styled.div<{ $status?: ColorStatus }>`
  align-items: center;
  background-color: ${({ $status }) =>
    Colors[`surface--status-${$status}--muted--default`]};
  border-radius: 4px;
  display: flex;
  height: 36px;
  justify-content: center;
  width: 36px;
`;

const RunNodeIcon = styled(Icon)<{ $status?: ColorStatus }>`
  color: ${({ $status }) => Colors[`text-icon--status-${$status}`]};
`;

const RunNodeTitle = styled(Overline)<{ $status?: ColorStatus }>`
  color: ${({ $status }) => Colors[`text-icon--status-${$status}`]};
`;
