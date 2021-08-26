import React from 'react';
import { Button } from '@cognite/cogs.js';
import { useReviewFiles, useConvertToSVG, isFileApproved } from 'hooks';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { FileInfo } from '@cognite/cdf-sdk-singleton';
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

  const { data: file } = useCdfItem<FileInfo>('files', {
    id: Number(fileId!),
  });
  const isLoading = isOnApprovedLoading || isOnRejectedLoading;

  const isApproved = isFileApproved(file);

  return (
    <DropdownMenu column justify grow style={{ width: '200px' }}>
      <Button
        type="ghost"
        icon={isLoading ? 'LoadingSpinner' : 'Checkmark'}
        iconPlacement="left"
        onClick={() => onApproveDiagrams()}
        disabled={isLoading || isApproved}
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
        disabled={isLoading || isApproved}
        style={{ width: '100%' }}
      >
        Reject pending tags
      </Button>
    </DropdownMenu>
  );
};
