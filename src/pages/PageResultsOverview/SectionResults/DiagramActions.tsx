import React from 'react';
import { Button, Dropdown } from '@cognite/cogs.js';
import { useReviewFiles, useActiveWorkflow } from 'hooks';
import { useWorkflowDiagramsIds } from 'modules/workflows';
import { InfoWrapper } from './components';
import { MenuAll } from './DropdownMenu';

export default function DiagramActions() {
  const { workflowId } = useActiveWorkflow();
  const diagramsIds = useWorkflowDiagramsIds(workflowId, true, true);
  const { onApproveDiagrams, isOnApprovedLoading: isLoading } =
    useReviewFiles(diagramsIds);

  const onPreviewAllClick = () => {};

  return (
    <InfoWrapper>
      <Button
        icon="Checkmark"
        type="tertiary"
        onClick={() => onApproveDiagrams(true)}
        disabled={isLoading}
      >
        Approve all
      </Button>
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
