import { ResourcePreviewSidebar } from 'containers';
import React, { useContext } from 'react';
import styled from 'styled-components';
import { Detail, Icon, Title, Modal, Checkbox } from '@cognite/cogs.js';

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
  useZoomControls,
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
  setZoomedAnnotation: (
    zoomedAnnotation: CogniteAnnotation | undefined
  ) => void;
  setIsAnnotationsShown: (isAnnotationsShown: boolean) => void;
  isAnnotationsShown: boolean;
}

const FilePreviewSidebar = ({
  fileIcon,
  file,
  annotations,
  approveAnnotations,
  viewingAnnotations,
  setViewingAnnotations,
  setZoomedAnnotation,
  setIsAnnotationsShown,
  isAnnotationsShown,
}: FilePreviewSidebarProps) => {
  const sdk = useSDK();
  const context = useContext(AppContext);
  const email = context?.userInfo?.email || 'UNKNOWN';

  const { setSelectedAnnotations } = useSelectedAnnotations();
  const { reset } = useZoomControls();

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

  const handleGoBack = () => {
    setViewingAnnotations(undefined);
    setZoomedAnnotation(undefined);
    reset?.();
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
        goBack={handleGoBack}
        setZoomedAnnotation={setZoomedAnnotation}
      />
    );
  }
  return (
    <>
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
            <TitleIconWrapper>
              {fileIcon || <Icon type="Document" />}
              <Checkbox
                onChange={() => setIsAnnotationsShown(!isAnnotationsShown)}
                name="Hide annotations"
                checked={!isAnnotationsShown}
              >
                Hide annotations
              </Checkbox>
            </TitleIconWrapper>
            <FileTitle level={4}>{file?.name}</FileTitle>
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
    </>
  );
};

export default FilePreviewSidebar;

const TitleWrapper = styled.div`
  padding: 20px 10px;
  gap: 15px;
  display: flex;
  flex-direction: column;
`;

const TitleIconWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

const FileTitle = styled(Title)`
  word-break: break-word;
`;
