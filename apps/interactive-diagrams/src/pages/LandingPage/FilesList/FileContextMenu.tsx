import React from 'react';

import { DropdownMenu } from '@interactive-diagrams-app/components/Common';
import { useReviewFiles } from '@interactive-diagrams-app/hooks';
import { useWorkflowCreateNew } from '@interactive-diagrams-app/modules/workflows';
import {
  PNID_METRICS,
  trackUsage,
} from '@interactive-diagrams-app/utils/Metrics';

import { Button } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';

type Props = {
  file: FileInfo;
};

export const FileContextMenu = ({ file }: Props) => {
  const { createWorkflow } = useWorkflowCreateNew();
  const { onApproveDiagrams, onRejectDiagrams, onClearTags } = useReviewFiles([
    file.id,
  ]);

  const onFileApprove = () => onApproveDiagrams();
  const onFileReject = () => onRejectDiagrams();
  const onFileTagsClear = () => {
    trackUsage(PNID_METRICS.landingPage.deleteAnnotations, {
      fileId: file.id,
    });
    onClearTags([file.id]);
  };
  const onFileEdit = (): void => {
    const diagramToContextualize = {
      type: 'files',
      endpoint: 'retrieve',
      filter: [{ id: file.id }],
    };
    trackUsage(PNID_METRICS.landingPage.editFile, {
      fileId: file.id,
    });
    createWorkflow({ diagrams: diagramToContextualize });
  };

  return (
    <DropdownMenu column justify grow style={{ width: '250px' }}>
      <Button
        icon="Refresh"
        iconPlacement="left"
        style={buttonStyle}
        onClick={onFileEdit}
        type="ghost"
      >
        Recontextualize diagram
      </Button>
      <Button
        icon="Checkmark"
        iconPlacement="left"
        style={buttonStyle}
        onClick={onFileApprove}
        type="ghost"
      >
        Approve pending tags
      </Button>
      <Button
        icon="CloseLarge"
        iconPlacement="left"
        style={buttonStyle}
        onClick={onFileReject}
        type="ghost-destructive"
      >
        Reject pending tags
      </Button>
      <Button
        icon="Delete"
        iconPlacement="left"
        style={buttonStyle}
        onClick={onFileTagsClear}
        type="ghost-destructive"
      >
        Clear all tags
      </Button>
    </DropdownMenu>
  );
};

const buttonStyle = {
  width: '100%',
};
