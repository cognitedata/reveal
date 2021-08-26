import React from 'react';

import { Button, Dropdown } from '@cognite/cogs.js';
import { isFilePending, useReviewFiles, useActiveWorkflow } from 'hooks';
import { useWorkflowDiagramsIds, useWorkflowItems } from 'modules/workflows';

import { Tooltip } from 'antd';

import { InfoWrapper } from './components';
import { MenuAll } from './DropdownMenu';

export default function DiagramActions() {
  const { workflowId } = useActiveWorkflow();
  const diagramsIds = useWorkflowDiagramsIds(workflowId, true, true);
  const { diagrams } = useWorkflowItems(Number(workflowId), true);
  const { onApproveDiagrams, isOnApprovedLoading: isLoading } =
    useReviewFiles(diagramsIds);

  const onPreviewAllClick = () => {};

  const isApproveAllDisabled =
    isLoading || !diagrams.some((diagram) => isFilePending(diagram));

  return (
    <InfoWrapper>
      <Tooltip
        title={isApproveAllDisabled && 'All diagrams have been approved!'}
      >
        <Button
          icon="Checkmark"
          type="tertiary"
          disabled={isApproveAllDisabled}
          onClick={() => onApproveDiagrams(true)}
        >
          Approve all
        </Button>
      </Tooltip>
      <Button
        icon="ExpandMax"
        type="primary"
        onClick={onPreviewAllClick}
        disabled={isLoading}
      >
        Preview all
      </Button>
      <Dropdown content={<MenuAll />}>
        <Button icon="MoreOverflowEllipsisHorizontal" variant="ghost" />
      </Dropdown>
    </InfoWrapper>
  );
}
