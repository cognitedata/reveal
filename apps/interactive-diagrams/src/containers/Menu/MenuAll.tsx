import React, { useState } from 'react';
import { useReviewFiles, useActiveWorkflow, useConvertToSVG } from 'hooks';
import { useWorkflowDiagramsIds } from 'modules/workflows';
import { ModalSaveSVG } from 'containers';
import { DropdownMenu } from 'components/Common';
import { Button } from '@cognite/cogs.js';

// Context menu for all contextualized diagrams
export const MenuAll = ({ canRejectAll }: { canRejectAll: boolean }) => {
  const { workflowId } = useActiveWorkflow();
  const diagramIds = useWorkflowDiagramsIds(workflowId, true, true);
  const { isConverting } = useConvertToSVG(diagramIds);
  const [showModal, setShowModal] = useState<boolean>(false);
  const { onRejectDiagrams, isOnRejectedLoading: isLoading } =
    useReviewFiles(diagramIds);

  const isDisabled = isConverting;

  const onSaveSVGClick = () => setShowModal(true);

  return (
    <DropdownMenu column justify grow>
      <Button
        type="ghost"
        aria-label="Button-Save-SVG-All"
        iconPlacement="left"
        icon={isConverting ? 'Loader' : 'Save'}
        onClick={onSaveSVGClick}
        disabled={isDisabled}
        style={{ width: '100%', justifyContent: 'flex-start' }}
      >
        Save all as SVG
      </Button>
      <Button
        type="ghost-destructive"
        aria-label="Button-Reject-All"
        icon={isLoading ? 'Loader' : 'Delete'}
        iconPlacement="left"
        onClick={() => onRejectDiagrams(true)}
        disabled={isLoading || !canRejectAll}
        style={{ width: '100%', justifyContent: 'flex-start' }}
      >
        Reject all pending tags
      </Button>
      <ModalSaveSVG
        diagramIds={diagramIds}
        showModal={showModal}
        setShowModal={setShowModal}
      />
    </DropdownMenu>
  );
};
