import React from 'react';

import { useParams, useHistory } from 'react-router-dom';
import { Button, Dropdown } from '@cognite/cogs.js';
import { useWorkflowDiagramsIds, useWorkflowItems } from 'modules/workflows';
import { diagramPreview } from 'routes/paths';
import { useReviewFiles, useActiveWorkflow, isFilePending } from 'hooks';

import { Tooltip } from 'antd';
import { InfoWrapper } from './components';
import { MenuAll } from './DropdownMenu';

export default function DiagramActions() {
  const history = useHistory();
  const { tenant } = useParams<{ tenant: string }>();
  const { workflowId } = useActiveWorkflow();
  const diagramsIds = useWorkflowDiagramsIds(workflowId, true, true);
  const { diagrams } = useWorkflowItems(Number(workflowId), true);
  const { onApproveDiagrams, isOnApprovedLoading: isLoading } =
    useReviewFiles(diagramsIds);

  const noSuccessfulFiles = !diagramsIds?.length;

  const onPreviewAllClick = () => {
    if (!noSuccessfulFiles)
      history.push(diagramPreview.path(tenant, workflowId, diagramsIds[0]));
  };

  const isApproveAllDisabled =
    isLoading || !diagrams.some((diagram) => isFilePending(diagram));

  return (
    <InfoWrapper>
      <Tooltip
        title={isApproveAllDisabled && 'All diagrams have been approved!'}
      >
        <Button
          aria-label="Button-Approve-All"
          icon="Checkmark"
          type="tertiary"
          disabled={isApproveAllDisabled || noSuccessfulFiles}
          onClick={() => onApproveDiagrams(true)}
        >
          Approve all
        </Button>
      </Tooltip>
      <Button
        aria-label="Button-Preview-All"
        icon="ExpandMax"
        type="primary"
        onClick={onPreviewAllClick}
        disabled={isLoading || noSuccessfulFiles}
      >
        Preview all
      </Button>
      <Dropdown content={<MenuAll canRejectAll={!isApproveAllDisabled} />}>
        <Button
          icon="MoreOverflowEllipsisHorizontal"
          aria-label="Button-More-All"
          type="ghost"
        />
      </Dropdown>
    </InfoWrapper>
  );
}
