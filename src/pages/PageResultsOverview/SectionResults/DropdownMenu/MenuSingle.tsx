import React from 'react';
import { Button } from '@cognite/cogs.js';
import {
  useReviewFiles,
  useConvertToSVG,
  useActiveWorkflow,
  isFileApproved,
} from 'hooks';
import { FileInfo } from '@cognite/cdf-sdk-singleton';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { useFileStatus } from '../hooks';

import { DropdownMenu } from '.';

// Context menu for a single diagram
export const MenuSingle = ({ file }: { file: FileInfo }) => {
  const { workflowId } = useActiveWorkflow();
  const { convertDiagramToSVG, isConverting } = useConvertToSVG(file.id);
  const {
    onApproveDiagrams,
    onRejectDiagrams,
    isOnApprovedLoading,
    isOnRejectedLoading,
  } = useReviewFiles([file.id]);

  const { data: diagram } = useCdfItem<FileInfo>('files', {
    id: Number(file.id!),
  });
  const { didFileFail } = useFileStatus(workflowId, diagram);
  const isLoading = isOnApprovedLoading || isOnRejectedLoading;
  const isApproved = isFileApproved(diagram);
  const isFailed = Boolean(didFileFail);

  return (
    <DropdownMenu column justify grow style={{ width: '200px' }}>
      <Button
        type="ghost"
        icon={isLoading ? 'LoadingSpinner' : 'Checkmark'}
        iconPlacement="left"
        onClick={() => onApproveDiagrams()}
        disabled={isLoading || isApproved || isFailed}
        style={{ width: '100%' }}
      >
        Approve tags
      </Button>
      <Button
        type="ghost"
        icon={isConverting ? 'LoadingSpinner' : 'Save'}
        iconPlacement="left"
        onClick={() => convertDiagramToSVG()}
        disabled={isConverting || isFailed}
        style={{ width: '100%' }}
      >
        Save as SVG
      </Button>
      <Button
        type="ghost-danger"
        icon={isLoading ? 'LoadingSpinner' : 'Trash'}
        iconPlacement="left"
        onClick={() => onRejectDiagrams()}
        disabled={isLoading || isFailed || isApproved}
        style={{ width: '100%' }}
      >
        Reject pending tags
      </Button>
    </DropdownMenu>
  );
};
