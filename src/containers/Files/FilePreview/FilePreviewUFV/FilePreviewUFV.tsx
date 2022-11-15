import { FileInfo } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import ReactUnifiedViewer, {
  Annotation,
  AnnotationType,
  ContainerType,
  TooltipAnchorPosition,
  ToolType,
  UnifiedViewer,
} from '@cognite/unified-file-viewer';
import { DocumentContainerProps } from '@cognite/unified-file-viewer/dist/core/containers/DocumentContainer';
import { ImageContainerProps } from '@cognite/unified-file-viewer/dist/core/containers/ImageContainer';
import { Loader } from 'components';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { ResourceItem } from 'types';
import {
  isFilePreviewable,
  lightGrey,
  readablePreviewableFileTypes,
  removeSimilarAnnotations,
} from 'utils';
import { usePnIdOCRResultFilterQuery } from '../../../../domain/pnids/internal/hooks/usePnIdOCRResultFilterQuery';
import { useAnnotations } from '../../hooks';
import { AnnotationHoverPreview } from '../AnnotationHoverPreview';
import { ActionTools } from './ActionTools';
import { AnnotationPreviewSidebar } from './AnnotationPreviewSidebar';
import {
  DEFAULT_ZOOM_SCALE,
  MAX_CONTAINER_HEIGHT,
  MAX_CONTAINER_WIDTH,
} from './constants';
import { useFileDownloadUrl, useUnifiedFileViewerAnnotations } from './hooks';
import { Pagination } from './Pagination';
import {
  CommonLegacyCogniteAnnotation,
  ProposedCogniteAnnotation,
} from './types';
import getCogniteAnnotationFromUfvAnnotation from './getCogniteAnnotationFromUfvAnnotation';
import { getContainerId } from './utils';

export type FilePreviewUFVProps = {
  id: string;
  applicationId: string;
  fileId: number;
  creatable: boolean;
  contextualization: boolean;
  onItemClicked?: (item: ResourceItem) => void;
  fileIcon?: React.ReactNode;
  showControls?: boolean;
  showDownload?: boolean;
  showSideBar?: boolean;
  enableZoomToAnnotation?: boolean;
  enableToolTips?: boolean;
};

const RectangleToolProps = {
  tool: ToolType.RECTANGLE,
  toolOptions: {
    fill: 'transparent',
    strokeWidth: 4,
    stroke: 'black',
  },
};

const NoopToolProps = {
  tool: ToolType.NOOP,
};

export const FilePreviewUFV = ({
  id,
  applicationId,
  fileId,
  creatable,
  contextualization,
  onItemClicked,
  fileIcon,
  showDownload = false,
  showControls = true,
  showSideBar = true,
  enableZoomToAnnotation = true,
  enableToolTips = true,
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
    // NOTE: @cognite/annotations exports a PendingCogniteAnnotation, but that does not allow
    // us to set an id on the annotation, which is needed for the rendering of the annotation
    // this workaround existed in the previous version of the component as well.
    ProposedCogniteAnnotation[]
  >([]);

  const [isAnnotationsShown, setIsAnnotationsShown] = useState<boolean>(true);
  const [selectedAnnotations, setSelectedAnnotations] = useState<
    CommonLegacyCogniteAnnotation[]
  >([]);

  useEffect(() => {
    if (selectedAnnotations.length === 1) {
      const [annotation] = selectedAnnotations;
      if (enableZoomToAnnotation) {
        zoomToAnnotation(annotation);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAnnotations, enableZoomToAnnotation]);

  useEffect(() => {
    setPendingAnnotations([]);
    setSelectedAnnotations([]);
  }, [fileId]);

  useEffect(() => {
    if (!creatable) {
      setPendingAnnotations([]);
      setSelectedAnnotations([]);
    }
  }, [creatable]);

  const { data: file, isFetched: fileFetched } = useCdfItem<FileInfo>('files', {
    id: fileId,
  });

  const isMimeTypeSet = file && file.mimeType;
  const canPreviewFile = file && isFilePreviewable(file);

  const persistedAnnotations = useAnnotations(fileId);
  const annotations = useMemo(() => {
    const annotationsForFile = [
      ...persistedAnnotations,
      ...pendingAnnotations.filter(removeSimilarAnnotations),
    ];
    /** for the first page show annotations defined for first page or annotation without page property
     for other pages only show annotations for that page **/
    return annotationsForFile.filter(annotation => {
      if (page > 1) {
        return annotation.page === page;
      } else {
        return annotation.page === page || !annotation.page;
      }
    });
  }, [pendingAnnotations, persistedAnnotations, page]);

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
      const currentSelectedAnnotation = annotations.find(
        cogniteAnn => String(cogniteAnn.id) === annotation.id
      );
      // remove current annotation if already selected
      const isAlreadySelected = selectedAnnotations.some(
        selectedAnnotation => String(selectedAnnotation.id) === annotation.id
      );

      if (isAlreadySelected) {
        setSelectedAnnotations([]);
      } else {
        if (currentSelectedAnnotation) {
          setSelectedAnnotations([currentSelectedAnnotation]);
        }
      }
    },
    [selectedAnnotations, annotations]
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

  const handleAnnotationsUpdateRequest = (annotations: Annotation[]) => {
    if (file === undefined) {
      return;
    }

    if (annotations.length === 0) {
      return;
    }

    const annotation = annotations[0];
    if (annotation.type !== AnnotationType.RECTANGLE) {
      throw new Error('Only expecting rectangle annotations from this flow');
    }

    const pendingAnnotations = [
      getCogniteAnnotationFromUfvAnnotation(annotation, file, page),
    ];
    setPendingAnnotations(pendingAnnotations);
    setSelectedAnnotations(pendingAnnotations);
  };

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

  const displayAnnotations = useMemo(() => {
    if (isAnnotationsShown) {
      return [...allConvertedAnnotations, ...annotationSearchResult];
    }
    return [...annotationSearchResult];
  }, [isAnnotationsShown, allConvertedAnnotations, annotationSearchResult]);

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

  const toolProps = creatable ? RectangleToolProps : NoopToolProps;

  return (
    <FullHeightWrapper>
      <FullHeightWrapper>
        <ReactUnifiedViewer
          applicationId={applicationId}
          id={id}
          setRef={ref => setUnifiedViewerRef(ref)}
          container={container}
          annotations={displayAnnotations}
          tooltips={enableToolTips ? tooltips : undefined}
          onClick={onStageClick}
          shouldShowZoomControls={showControls}
          onAnnotationsUpdateRequest={handleAnnotationsUpdateRequest}
          {...toolProps}
        />
        <Pagination container={container} onPageChange={handlePageChange} />
        <ActionTools
          file={file}
          fileUrl={fileUrl}
          fileViewerRef={unifiedViewerRef}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          enableDownload={showDownload}
          enableSearch={showControls}
        />
      </FullHeightWrapper>
      {showSideBar && (
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
      )}
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
  box-sizing: content-box;
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
