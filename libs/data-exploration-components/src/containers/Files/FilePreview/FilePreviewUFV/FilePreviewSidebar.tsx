import { ResourcePreviewSidebarUFV } from 'containers';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Detail, Icon, Title, Modal, Checkbox } from '@cognite/cogs.js';

import { FileInfo } from '@cognite/sdk';
import AnnotationsList from './AnnotationsList';
import { useDisclosure } from 'hooks';
import { useReviewFile } from '../../hooks';
import DiagramReviewStatus from '../DiagramStatus';
import FileReview from './FileReview';
import {
  isAssetAnnotation,
  isFileAnnotation,
  isSuggestedAnnotation,
} from './migration/utils';
import { ExtendedAnnotation } from './types';

interface FilePreviewSidebarProps {
  fileIcon?: React.ReactNode;
  file?: FileInfo;
  annotations: ExtendedAnnotation[];
  approveAnnotations: (annotations: ExtendedAnnotation[]) => void;
  viewingAnnotations?: 'assets' | 'files';
  setViewingAnnotations: (type: 'assets' | 'files' | undefined) => void;
  setIsAnnotationsShown: (isAnnotationsShown: boolean) => void;
  isAnnotationsShown: boolean;
  reset: () => void;
  setSelectedAnnotations: (annotations: ExtendedAnnotation[]) => void;
}

const FilePreviewSidebar = ({
  fileIcon,
  file,
  annotations,
  approveAnnotations,
  viewingAnnotations,
  setViewingAnnotations,
  setIsAnnotationsShown,
  isAnnotationsShown,
  reset,
  setSelectedAnnotations,
}: FilePreviewSidebarProps) => {
  const { onApproveFile } = useReviewFile(file?.id);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const onApproveAllAnnotations = async () => {
    const unhandledAnnotations = annotations.filter(isSuggestedAnnotation);
    await approveAnnotations(unhandledAnnotations);
    await onApproveFile();
    setSelectedAnnotations([]);
    onClose();
  };

  const handleGoBack = () => {
    setViewingAnnotations(undefined);
    reset?.();
  };

  const filteredAnnotations = useMemo(() => {
    return annotations.filter(annotation => {
      if (viewingAnnotations === 'assets') {
        return isAssetAnnotation(annotation);
      }

      if (viewingAnnotations === 'files') {
        return isFileAnnotation(annotation);
      }

      return false;
    });
  }, [viewingAnnotations, annotations]);

  if (viewingAnnotations) {
    return (
      <AnnotationsList
        annotations={filteredAnnotations}
        type={viewingAnnotations}
        goBack={handleGoBack}
        reset={reset}
        setSelectedAnnotations={setSelectedAnnotations}
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
      <ResourcePreviewSidebarUFV
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
