import { DocumentContainerProps } from '@cognite/unified-file-viewer/dist/core/containers/DocumentContainer';
import { ImageContainerProps } from '@cognite/unified-file-viewer/dist/core/containers/ImageContainer';
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
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { ResourceItem } from 'types';
import { usePnIdOCRResultFilterQuery } from '../../../../domain/pnids/internal/hooks/usePnIdOCRResultFilterQuery';
import { ActionTools } from './ActionTools';
import { AnnotationPreviewSidebar } from './AnnotationPreviewSidebar';
import { useAnnotations } from '../../hooks';
import { useFileDownloadUrl, useUnifiedFileViewerAnnotations } from './hooks';
import { Pagination } from './Pagination';
import { AnnotationHoverPreview } from '../AnnotationHoverPreview';
import {
  CommonLegacyCogniteAnnotation,
  ProposedCogniteAnnotation,
} from './types';
import ReactUnifiedViewer, {
  Annotation,
  ContainerType,
  TooltipAnchorPosition,
  UnifiedViewer,
} from '@cognite/unified-file-viewer';
import { getContainerId } from './utils';
import {
  DEFAULT_ZOOM_SCALE,
  MAX_CONTAINER_HEIGHT,
  MAX_CONTAINER_WIDTH,
} from './constants';

const UNIFIED_VIEWER_CONTAINER_ID = 'unified-viewer-container';

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
  showZoomControls = true,
}: FilePreviewUFVProps) => {
  // Later work includes merging the two components
  const [unifiedViewerRef, setUnifiedViewerRef] = useState<UnifiedViewer>();
  const [page, setPage] = useState(1);
  const [container, setContainer] = useState<
    DocumentContainerProps | ImageContainerProps
  >();
  const [hoverId, setHoverId] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pendingAnnotations, setPendingAnnotations] = useState<
    ProposedCogniteAnnotation[]
  >([]);

  const [isAnnotationsShown, setIsAnnotationsShown] = useState<boolean>(true);
  const [selectedAnnotations, setSelectedAnnotations] = useState<
    CommonLegacyCogniteAnnotation[]
  >([]);

  useEffect(() => {
    if (selectedAnnotations.length === 1) {
      const [annotation] = selectedAnnotations;
      zoomToAnnotation(annotation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAnnotations]);

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
  const annotations = useMemo(() => {
    return [
      ...persistedAnnotations,
      ...pendingAnnotations.filter(removeSimilarAnnotations),
    ];
  }, [pendingAnnotations, persistedAnnotations]);

  // converts cognite annotations to UFV annotation and applies styles

  // const handleCreateAnnotation = (item: PendingCogniteAnnotation) => {
  //   const newItem = { ...item, id: uuid() };
  //   setPendingAnnotations([newItem]);
  //   return false;
  // };

  const fileUrl = useFileDownloadUrl(file?.id);

  useEffect(() => {
    if (file?.id && file?.mimeType && fileUrl) {
      const containerId = getContainerId(file.id);
      if (file.mimeType === 'application/pdf') {
        setContainer({
          type: ContainerType.DOCUMENT,
          id: containerId,
          url: fileUrl,
          page,
          maxWidth: MAX_CONTAINER_WIDTH,
          maxHeight: MAX_CONTAINER_HEIGHT,
        } as DocumentContainerProps);
        return;
      }

      setContainer({
        type: ContainerType.IMAGE,
        id: containerId,
        url: fileUrl,
        page,
        maxWidth: MAX_CONTAINER_WIDTH,
        maxHeight: MAX_CONTAINER_HEIGHT,
      } as ImageContainerProps);
    }
  }, [file, file?.id, file?.mimeType, fileUrl, page]);

  const tooltips = useMemo(() => {
    const focusedAnnotation = annotations.find(
      ({ id }) => String(id) === hoverId
    );
    if (!focusedAnnotation) {
      return undefined;
    }

    return [
      {
        targetId: String(focusedAnnotation?.id),
        content: <AnnotationHoverPreview annotation={[focusedAnnotation]} />,
        anchorTo: TooltipAnchorPosition.BOTTOM,
      },
    ];
  }, [hoverId, annotations]);

  const onClickAnnotation = useCallback(
    (annotation: Annotation) => {
      const legacyCogniteAnnotations = annotations.filter(
        cogniteAnn => String(cogniteAnn.id) === annotation.id
      );
      setSelectedAnnotations(legacyCogniteAnnotations || []);
    },
    [setSelectedAnnotations, annotations]
  );

  const onAnnotationMouseOver = useCallback((annotation: Annotation) => {
    setHoverId(annotation.id);
  }, []);

  const onAnnotationMouseOut = useCallback(() => {
    setHoverId(undefined);
  }, []);

  const onStageClick = useCallback(() => {
    setSelectedAnnotations([]);
  }, [setSelectedAnnotations]);

  const { annotationSearchResult } = usePnIdOCRResultFilterQuery(
    searchQuery,
    file
  );

  const allConvertedAnnotations = useUnifiedFileViewerAnnotations({
    fileId,
    annotations: annotations,
    selectedAnnotations,
    pendingAnnotations,
    hoverId,
    onClick: onClickAnnotation,
    onMouseOver: onAnnotationMouseOver,
    onMouseOut: onAnnotationMouseOut,
  });

  const zoomToAnnotation = (annotation: CommonLegacyCogniteAnnotation) =>
    unifiedViewerRef?.zoomToAnnotationById(String(annotation.id), {
      scale: DEFAULT_ZOOM_SCALE,
    });

  const handlePageChange = (pageNumber: number) => setPage(pageNumber);

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

  if (!fileFetched || container === undefined) {
    return <Loader />;
  }

  return (
    <FullHeightWrapper>
      <FullHeightWrapper>
        <Pagination container={container} onPageChange={handlePageChange}>
          <ReactUnifiedViewer
            id={UNIFIED_VIEWER_CONTAINER_ID}
            setRef={ref => setUnifiedViewerRef(ref)}
            container={container}
            annotations={[
              ...allConvertedAnnotations,
              ...annotationSearchResult,
            ]}
            tooltips={tooltips}
            onClick={onStageClick}
            shouldShowZoomControls={showZoomControls}
          />
        </Pagination>
        <ActionTools
          file={file}
          fileUrl={fileUrl}
          fileViewerRef={unifiedViewerRef}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          enableDownload
          enableSearch
        />
      </FullHeightWrapper>
      <SidebarWrapper>
        <AnnotationPreviewSidebar
          file={file}
          setIsAnnotationsShown={setIsAnnotationsShown}
          isAnnotationsShown={isAnnotationsShown}
          setPendingAnnotations={setPendingAnnotations}
          contextualization={contextualization}
          onItemClicked={onItemClicked}
          annotations={annotations}
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
