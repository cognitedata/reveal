import React from 'react';
import { FileInfo } from '@cognite/sdk';
import { DropdownMenu, MenuButton } from 'components/Common';
import { useReviewFiles } from 'hooks';
import { useWorkflowCreateNew } from 'modules/workflows';
import { PNID_METRICS, trackUsage } from 'utils/Metrics';

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
      <MenuButton
        icon="Refresh"
        iconPlacement="left"
        style={buttonStyle}
        onClick={onFileEdit}
        type="ghost"
      >
        Recontextualize diagram
      </MenuButton>
      <MenuButton
        icon="Checkmark"
        iconPlacement="left"
        style={buttonStyle}
        onClick={onFileApprove}
        type="ghost"
      >
        Approve pending tags
      </MenuButton>
      <MenuButton
        icon="CloseLarge"
        iconPlacement="left"
        style={buttonStyle}
        onClick={onFileReject}
        type="ghost-danger"
      >
        Reject pending tags
      </MenuButton>
      <MenuButton
        icon="Delete"
        iconPlacement="left"
        style={buttonStyle}
        onClick={onFileTagsClear}
        type="ghost-danger"
      >
        Clear all tags
      </MenuButton>
    </DropdownMenu>
  );
};

const buttonStyle = {
  width: '100%',
};
