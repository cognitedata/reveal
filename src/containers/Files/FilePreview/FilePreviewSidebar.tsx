import { ResourcePreviewSidebar } from 'containers';
import React from 'react';
import styled from 'styled-components';
import { lightGrey } from 'utils/Colors';
import { Detail, Icon, Title } from '@cognite/cogs.js';
import { Modal } from 'antd';
import { FileInfo } from '@cognite/sdk';
import {
  AnnotationStatus,
  CogniteAnnotation,
  CogniteAnnotationPatch,
  linkFileToAssetIds,
} from '@cognite/annotations';
import { useSDK } from '@cognite/sdk-provider';
import { useUserInfo } from '@cognite/sdk-react-query-hooks';
import {
  ProposedCogniteAnnotation,
  useSelectedAnnotations,
} from '@cognite/react-picture-annotation';
import AnnotationsList from 'components/AnnotationsList';
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
  const { data: userData } = useUserInfo();
  const { email = 'UNKNOWN' } = userData || {};

  const { setSelectedAnnotations } = useSelectedAnnotations();

  const { onApproveFile } = useReviewFile(file?.id);

  const onApproveAllAnnotations = () => {
    Modal.confirm({
      okText: 'Approve tags',
      title: 'Are you sure?',
      content: (
        <span>
          Are you sure you want to approve all tags for this file? Changes will
          be saved to CDF.
        </span>
      ),
      onOk: async () => {
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
      },
      onCancel: () => {},
    });
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
      <ResourcePreviewSidebar
        hideTitle
        hideContent
        closable={false}
        header={
          <TitleWrapper>
            {fileIcon || <Icon type="PDF" />}
            <Title level={4}>{file?.name} </Title>
            {file?.id && (
              <div>
                <DiagramReviewStatus fileId={file.id} />
                <Detail>- Interactive Diagram</Detail>
              </div>
            )}
            <FileReview
              annotations={annotations}
              onApprove={onApproveAllAnnotations}
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
