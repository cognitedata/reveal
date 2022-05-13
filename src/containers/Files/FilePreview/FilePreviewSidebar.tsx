import { ResourcePreviewSidebar } from 'containers';
import React, { useContext } from 'react';
import styled from 'styled-components';
import { lightGrey } from 'utils/Colors';
import { Detail, Icon, Title, Modal } from '@cognite/cogs.js';

import { FileInfo } from '@cognite/sdk';
import {
  AnnotationStatus,
  CogniteAnnotation,
  CogniteAnnotationPatch,
  linkFileToAssetIds,
} from '@cognite/annotations';
import { useSDK } from '@cognite/sdk-provider';
import {
  ProposedCogniteAnnotation,
  useSelectedAnnotations,
} from '@cognite/react-picture-annotation';
import { AppContext } from 'context/AppContext';
import AnnotationsList from 'components/AnnotationsList';
import { useDisclosure } from 'hooks';
import { useReviewFile } from '../hooks';
import DiagramReviewStatus from './DiagramStatus';
import FileReview from './FileReview';

interface FilePreviewSidebarProps {
  fileIcon?: React.ReactNode;
  file?: FileInfo;
  annotations: Array<CogniteAnnotation | ProposedCogniteAnnotation>;
  approveAnnotations: (updatePatch: CogniteAnnotationPatch[]) => void;
  viewingAnnotations?: 'assets' | 'files';
  setViewingAnnotations: (type: 'assets' | 'files' | undefined) => void;
}

const FilePreviewSidebar = ({
  fileIcon,
  file,
  annotations,
  approveAnnotations,
  viewingAnnotations,
  setViewingAnnotations,
}: FilePreviewSidebarProps) => {
  const sdk = useSDK();
  const context = useContext(AppContext);
  const email = context?.userInfo?.email || 'UNKNOWN';

  const { setSelectedAnnotations } = useSelectedAnnotations();

  const { onApproveFile } = useReviewFile(file?.id);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const onApproveAllAnnotations = async () => {
    const unhandledAnnotations = annotations.filter(
      a => a.status === 'unhandled'
    ) as Array<CogniteAnnotation>;
    const updatePatch = unhandledAnnotations.map(annotation => ({
      id: Number(annotation.id),
      annotation,
      update: {
        status: {
          set: 'verified' as AnnotationStatus,
        },
        checkedBy: {
          set: email,
        },
      },
    }));
    approveAnnotations(updatePatch);
    await onApproveFile();
    await linkFileToAssetIds(sdk, unhandledAnnotations);
    setSelectedAnnotations([]);
    onClose();
  };

  if (viewingAnnotations) {
    return (
      <AnnotationsList
        annotations={annotations.filter(an =>
          viewingAnnotations === 'assets'
            ? an.resourceType === 'asset'
            : an.resourceType === 'file'
        )}
        type={viewingAnnotations}
        goBack={() => setViewingAnnotations(undefined)}
      />
    );
  }
  return (
    <div style={{ width: 360, borderLeft: `1px solid ${lightGrey}` }}>
      <Modal
        okText="Approve tags"
        title="Are you sure?"
        onCancel={onClose}
        visible={isOpen}
        onOk={onApproveAllAnnotations}
      >
        <span>
          Are you sure you want to approve all tags for this file? Changes will
          be saved to CDF.
        </span>
      </Modal>
      <ResourcePreviewSidebar
        hideTitle
        hideContent
        closable={false}
        header={
          <TitleWrapper>
            {fileIcon || <Icon type="Document" />}
            <Title level={4}>{file?.name} </Title>
            {file?.id && (
              <div>
                <DiagramReviewStatus fileId={file.id} />
                <Detail>- Interactive Diagram</Detail>
              </div>
            )}
            <FileReview
              annotations={annotations}
              onApprove={onOpen}
              onTypeClick={(type: 'assets' | 'files') =>
                setViewingAnnotations(type)
              }
            />
          </TitleWrapper>
        }
        onClose={() => setSelectedAnnotations([])}
      />
    </div>
  );
};

export default FilePreviewSidebar;

const TitleWrapper = styled.div`
  padding: 20px 10px;
  gap: 15px;
  display: flex;
  flex-direction: column;
`;
