import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FileInfo } from '@cognite/sdk';
import { Loader } from 'components';
import styled from 'styled-components';
import {
  isFilePreviewable,
  lightGrey,
  readablePreviewableFileTypes,
  removeSimilarAnnotations,
} from 'utils';
import {
  CogniteAnnotation,
  PendingCogniteAnnotation,
} from '@cognite/annotations';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { ResourceItem } from 'types';
import { AnnotationPreviewSidebar } from './AnnotationPreviewSidebar';
import { useAnnotations } from '../../hooks';
import { UnifiedFileViewerWrapper } from './UnifiedFileViewerWrapper';
import { useSDK } from '@cognite/sdk-provider';
import { v4 as uuid } from 'uuid';
import { AnnotationHoverPreview } from '../AnnotationHoverPreview';
import {
  CommonLegacyCogniteAnnotation,
  ProposedCogniteAnnotation,
} from './types';
import {
  Annotation,
  getAnnotationsFromLegacyCogniteAnnotations,
  UnifiedViewer,
} from '@cognite/unified-file-viewer';
import { applyStylesToUFVAnnotation, getContainerId } from './utils';
import { DEFAULT_ZOOM_SCALE } from './constants';
import { LegacyCogniteAnnotation } from '@cognite/unified-file-viewer/dist/core/utils/api';

export type FilePreviewUFVProps = {
  fileId: number;
  creatable: boolean;
  contextualization: boolean;
  showZoomControls: boolean;
  onItemClicked?: (item: ResourceItem) => void;
  fileIcon?: React.ReactNode;
};

export const FilePreviewUFV = ({
  fileId,
  creatable,
  contextualization,
  onItemClicked,
  fileIcon,
  showZoomControls = false,
}: FilePreviewUFVProps) => {
  // TODO: This is now duplicated in UnifiedFileViewerWrapper
  // Later work includes merging the two components
  const [unifiedViewerRef, setUnifiedViewerRef] = useState<UnifiedViewer>();
  const sdk = useSDK();

  const [selectedAnnotations, setSelectedAnnotations] = useState<
    (CogniteAnnotation | ProposedCogniteAnnotation)[]
  >([]);

  const [pendingAnnotations, setPendingAnnotations] = useState<
    ProposedCogniteAnnotation[]
  >([]);

  const [zoomedAnnotation, setZoomedAnnotation] = useState<
    CommonLegacyCogniteAnnotation | undefined
  >();

  const [isAnnotationsShown, setIsAnnotationsShown] = useState<boolean>(true);

  useEffect(() => {
    setPendingAnnotations([]);
  }, [fileId]);

  useEffect(() => {
    if (!creatable) {
      setPendingAnnotations([]);
    }
  }, [creatable]);

  const { data: file, isFetched: fileFetched } = useCdfItem<FileInfo>('files', {
    id: fileId,
  });

  const isMimeTypeSet = file && file.mimeType;
  const canPreviewFile = file && isFilePreviewable(file);

  const persistedAnnotations = useAnnotations(fileId);
  const allAnnotations = useMemo(() => {
    return [
      ...persistedAnnotations,
      ...pendingAnnotations.filter(removeSimilarAnnotations),
    ];
  }, [pendingAnnotations, persistedAnnotations]);

  // apply styles conditionally to ufv annotation
  const getUFVAnnotationWithStyles = useCallback(
    (
      ufvAnnotation: Annotation,
      cogniteAnnotation: CommonLegacyCogniteAnnotation,
      isSelected: boolean
    ): Annotation => {
      const isPending = pendingAnnotations.some(
        ({ id }) => id == cogniteAnnotation.id
      );
      const styledUfvAnnotation = applyStylesToUFVAnnotation(
        ufvAnnotation,
        isSelected,
        isPending,
        cogniteAnnotation.resourceType
      );

      if (cogniteAnnotation.metadata && cogniteAnnotation.metadata.color) {
        styledUfvAnnotation.style.stroke = cogniteAnnotation.metadata.color;
      }
      return styledUfvAnnotation as Annotation;
    },
    [pendingAnnotations]
  );

  // converts cognite annotations to UFV annotation and applies styles

  const renderAnnotationCallback = useCallback(
    (annotation: CommonLegacyCogniteAnnotation, isSelected: boolean) => {
      const [ufvAnnotation] = getAnnotationsFromLegacyCogniteAnnotations(
        [annotation as LegacyCogniteAnnotation],
        getContainerId(fileId)
      );
      let renderAnnotation;
      if (ufvAnnotation) {
        renderAnnotation = getUFVAnnotationWithStyles(
          ufvAnnotation,
          annotation,
          isSelected
        );
      }
      return renderAnnotation;
    },
    [getUFVAnnotationWithStyles, fileId]
  );

  if (!fileFetched) {
    return <Loader />;
  }

  if (!isMimeTypeSet) {
    return (
      <CenteredPlaceholder>
        <h1>No preview</h1>
        <p>
          Please set a MIME type first. <br />
          File types that can be previewed are: {readablePreviewableFileTypes()}
        </p>
      </CenteredPlaceholder>
    );
  }

  if (!canPreviewFile) {
    return (
      <CenteredPlaceholder>
        <h1>No preview for this type of file</h1>
        <p>
          File types that can be previewed are: {readablePreviewableFileTypes()}
        </p>
      </CenteredPlaceholder>
    );
  }

  const handleAnnotationSelectedFromDoc = (
    selectedAnnotations: CommonLegacyCogniteAnnotation[]
  ) => {
    setZoomedAnnotation(selectedAnnotations[0]);
  };

  const getAnnotations = () => {
    return isAnnotationsShown ? allAnnotations : [];
  };

  const handleCreateAnnotation = (item: PendingCogniteAnnotation) => {
    const newItem = { ...item, id: uuid() };
    setPendingAnnotations([newItem]);
    return false;
  };

  return (
    <FullHeightWrapper>
      <UnifiedFileViewerWrapper
        file={file}
        sdk={sdk}
        hideControls={!showZoomControls}
        annotations={getAnnotations()}
        creatable
        hoverable
        onCreateAnnotation={handleCreateAnnotation}
        onSelectAnnotations={handleAnnotationSelectedFromDoc}
        zoomOnAnnotation={
          zoomedAnnotation && {
            annotation: zoomedAnnotation,
            scale: DEFAULT_ZOOM_SCALE,
          }
        }
        renderItemPreview={annotation => (
          <AnnotationHoverPreview annotation={[annotation]} />
        )}
        renderAnnotation={renderAnnotationCallback}
        onRef={setUnifiedViewerRef}
      />
      <SidebarWrapper>
        <AnnotationPreviewSidebar
          file={file}
          setIsAnnotationsShown={setIsAnnotationsShown}
          isAnnotationsShown={isAnnotationsShown}
          setPendingAnnotations={setPendingAnnotations}
          setZoomedAnnotation={setZoomedAnnotation}
          contextualization={contextualization}
          onItemClicked={onItemClicked}
          annotations={allAnnotations}
          fileIcon={fileIcon}
          reset={() => unifiedViewerRef?.zoomToFit()}
          selectedAnnotations={selectedAnnotations}
          setSelectedAnnotations={setSelectedAnnotations}
        />
      </SidebarWrapper>
    </FullHeightWrapper>
  );
};

const FullHeightWrapper = styled.div`
  display: flex;
  flex: 1;
  height: 100%;
  position: relative;
`;

const SidebarWrapper = styled.div`
  height: 100%;
  max-width: 360px;
  overflow: auto;
  flex-grow: 0;
  border-left: 1px solid ${lightGrey};
  background-color: white;
`;

const CenteredPlaceholder = styled.div`
  justify-content: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  margin: 0 auto;
  text-align: center;
`;
