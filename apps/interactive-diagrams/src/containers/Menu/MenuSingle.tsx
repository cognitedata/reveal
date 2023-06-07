import React, { useState } from 'react';
import {
  useReviewFiles,
  useConvertToSVG,
  isFileApproved,
  useFileStatus,
} from 'hooks';
import { ModalSaveSVG } from 'containers';
import { MenuButton, DropdownMenu } from 'components/Common';
import { FileInfo } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

// Context menu for a single diagram
export const MenuSingle = ({ file }: { file: FileInfo }) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const { isConverting } = useConvertToSVG([file.id]);
  const {
    onApproveDiagrams,
    onRejectDiagrams,
    onClearTags,
    isOnApprovedLoading,
    isOnRejectedLoading,
  } = useReviewFiles([file.id]);

  const { data: diagram } = useCdfItem<FileInfo>('files', {
    id: Number(file.id!),
  });
  const { didFileFail } = useFileStatus(diagram);
  const isLoading = isOnApprovedLoading || isOnRejectedLoading;
  const isApproved = isFileApproved(diagram);
  const isFailed = Boolean(didFileFail);

  const onSaveSVGClick = () => setShowModal(true);

  return (
    <DropdownMenu column justify grow style={{ width: '200px' }}>
      <MenuButton
        type="ghost"
        aria-label="Button-Approve-Single"
        icon={isLoading ? 'Loader' : 'Checkmark'}
        iconPlacement="left"
        onClick={() => onApproveDiagrams(true)}
        disabled={isLoading || isApproved || isFailed}
        style={{ width: '100%' }}
      >
        Approve tags
      </MenuButton>
      <MenuButton
        type="ghost"
        aria-label="Button-Save-SVG-Single"
        icon={isConverting ? 'Loader' : 'Save'}
        iconPlacement="left"
        onClick={onSaveSVGClick}
        disabled={isConverting || isFailed}
        style={{ width: '100%' }}
      >
        Save as SVG
      </MenuButton>
      <MenuButton
        type="ghost-danger"
        aria-label="Button-Reject-Single"
        icon={isLoading ? 'Loader' : 'CloseLarge'}
        iconPlacement="left"
        onClick={() => onRejectDiagrams(true)}
        disabled={isLoading || isFailed || isApproved}
        style={{ width: '100%' }}
      >
        Reject pending tags
      </MenuButton>
      <MenuButton
        type="ghost-danger"
        aria-label="Button-Clear-Single"
        icon={isLoading ? 'Loader' : 'Delete'}
        iconPlacement="left"
        onClick={() => onClearTags([file.id])}
        disabled={isLoading}
        style={{ width: '100%' }}
      >
        Clear all tags
      </MenuButton>
      <ModalSaveSVG
        diagramIds={[file.id]}
        showModal={showModal}
        setShowModal={setShowModal}
      />
    </DropdownMenu>
  );
};
