import React from 'react';
import { Button } from '@cognite/cogs.js';
import { useReviewFiles, useConvertToSVG } from 'hooks';
import { DropdownMenu } from '.';

// Context menu for a single diagram
export const MenuSingle = ({ fileId }: { fileId: number }) => {
  const { convertDiagramToSVG, isConverting } = useConvertToSVG(fileId);
  const {
    onApproveDiagrams,
    onRejectDiagrams,
    isOnApprovedLoading,
    isOnRejectedLoading,
  } = useReviewFiles([fileId]);
  const isLoading = isOnApprovedLoading || isOnRejectedLoading;

  return (
    <DropdownMenu column justify grow style={{ width: '200px' }}>
      <Button
        type="ghost"
        icon={isLoading ? 'LoadingSpinner' : 'Checkmark'}
        iconPlacement="left"
        onClick={() => onApproveDiagrams()}
        disabled={isLoading}
        style={{ width: '100%' }}
      >
        Approve tags
      </Button>
      <Button
        type="ghost"
        icon={isConverting ? 'LoadingSpinner' : 'Save'}
        iconPlacement="left"
        onClick={() => convertDiagramToSVG()}
        disabled={isConverting}
        style={{ width: '100%' }}
      >
        Save as SVG
      </Button>
      <Button
        type="ghost-danger"
        icon={isLoading ? 'LoadingSpinner' : 'Trash'}
        iconPlacement="left"
        onClick={() => onRejectDiagrams()}
        disabled={isLoading}
        style={{ width: '100%' }}
      >
        Reject detected tags
      </Button>
    </DropdownMenu>
  );
};
