import React from 'react';
import { Button, Tooltip } from '@cognite/cogs.js';
import { useReviewFiles, useActiveWorkflow } from 'hooks';
import { useWorkflowDiagramsIds } from 'modules/workflows';
import { DropdownMenu } from 'components/Common';

// Context menu for all contextualized diagrams
export const MenuAll = ({ canRejectAll }: { canRejectAll: boolean }) => {
  const { workflowId } = useActiveWorkflow();
  const diagramIds = useWorkflowDiagramsIds(workflowId, true, true);
  const { onRejectDiagrams, isOnRejectedLoading: isLoading } =
    useReviewFiles(diagramIds);

  const onSaveAllClick = () => {};

  const isDisabled = true;

  return (
    <DropdownMenu column justify grow>
      <Tooltip content="This option is temporarily disabled. You can still convert diagrams to SVG one by one.">
        <Button
          type="ghost"
          icon="Save"
          aria-label="Button-Save-SVG-All"
          iconPlacement="left"
          onClick={onSaveAllClick}
          disabled={isDisabled}
          style={{ width: '100%', justifyContent: 'flex-start' }}
        >
          Save all as SVG
        </Button>
      </Tooltip>
      <Button
        type="ghost-danger"
        aria-label="Button-Reject-All"
        icon={isLoading ? 'LoadingSpinner' : 'Trash'}
        iconPlacement="left"
        onClick={() => onRejectDiagrams(true)}
        disabled={isLoading || !canRejectAll}
        style={{ width: '100%', justifyContent: 'flex-start' }}
      >
        Reject all pending tags
      </Button>
    </DropdownMenu>
  );
};
