import React, { useState } from 'react';
import { useReviewFiles, useActiveWorkflow, useConvertToSVG } from 'hooks';
import { useWorkflowDiagramsIds } from 'modules/workflows';
import { ModalSaveSVG } from 'containers';
import { MenuButton, DropdownMenu } from 'components/Common';

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
      <MenuButton
        type="ghost"
        aria-label="Button-Save-SVG-All"
        iconPlacement="left"
        icon={isConverting ? 'Loader' : 'Save'}
        onClick={onSaveSVGClick}
        disabled={isDisabled}
        style={{ width: '100%', justifyContent: 'flex-start' }}
      >
        Save all as SVG
      </MenuButton>
      <MenuButton
        type="ghost-danger"
        aria-label="Button-Reject-All"
        icon={isLoading ? 'Loader' : 'Delete'}
        iconPlacement="left"
        onClick={() => onRejectDiagrams(true)}
        disabled={isLoading || !canRejectAll}
        style={{ width: '100%', justifyContent: 'flex-start' }}
      >
        Reject all pending tags
      </MenuButton>
      <ModalSaveSVG
        diagramIds={diagramIds}
        showModal={showModal}
        setShowModal={setShowModal}
      />
    </DropdownMenu>
  );
};
