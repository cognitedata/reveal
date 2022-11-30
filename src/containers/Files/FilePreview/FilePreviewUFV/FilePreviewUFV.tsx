import { FileInfo } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import ReactUnifiedViewer, {
  Annotation,
  AnnotationType,
  getContainerConfigFromFileInfo,
  TooltipAnchorPosition,
  ToolType,
  UnifiedViewer,
} from '@cognite/unified-file-viewer';
import { Loader } from 'components';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { ResourceItem } from 'types';
import {
  isFilePreviewable,
  lightGrey,
  readablePreviewableFileTypes,
} from 'utils';
import { usePnIdOCRResultFilterQuery } from '../../../../domain/pnids/internal/hooks/usePnIdOCRResultFilterQuery';
import { AnnotationHoverPreview } from './AnnotationHoverPreview';
import { ActionTools } from './ActionTools';
import { AnnotationPreviewSidebar } from './AnnotationPreviewSidebar';
import {
  DEFAULT_ZOOM_SCALE,
  MAX_CONTAINER_HEIGHT,
  MAX_CONTAINER_WIDTH,
} from './constants';
import getExtendedAnnotationsWithBadges from './getExtendedAnnotationsWithBadges';
import { useUnifiedFileViewerAnnotations } from './hooks';
import { Pagination } from './Pagination';
import {
  ANNOTATION_SOURCE_KEY,
  AnnotationSource,
  ExtendedAnnotation,
} from './types';
import { getContainerId } from './utils';
import { FileContainerProps } from '@cognite/unified-file-viewer/dist/core/utils/getContainerConfigFromUrl';

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
  const [unifiedViewerRef, setUnifiedViewerRef] = useState<UnifiedViewer>();
  const [page, setPage] = useState(1);
  const [container, setContainer] = useState<FileContainerProps>();
  const [hoverId, setHoverId] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pendingAnnotations, setPendingAnnotations] = useState<
    ExtendedAnnotation[]
  >([]);
  const sdk = useSDK();

  const [isAnnotationsShown, setIsAnnotationsShown] = useState<boolean>(true);
  const [selectedAnnotations, setSelectedAnnotations] = useState<
    ExtendedAnnotation[]
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

  useEffect(() => {
    (async () => {
      if (file?.id && file?.mimeType) {
        setContainer(
          await getContainerConfigFromFileInfo(sdk as any, file, {
            id: getContainerId(file.id),
            page,
            maxWidth: MAX_CONTAINER_WIDTH,
            maxHeight: MAX_CONTAINER_HEIGHT,
          })
        );
      }
    })();
  }, [file, file?.id, file?.mimeType, page, sdk]);

  const onClickAnnotation = useCallback(
    (annotation: ExtendedAnnotation) =>
      setSelectedAnnotations(prevSelectedAnnotations =>
        prevSelectedAnnotations.some(
          prevSelectedAnnotation => prevSelectedAnnotation.id === annotation.id
        )
          ? []
          : [annotation]
      ),
    [setSelectedAnnotations]
  );

  const onAnnotationMouseOver = useCallback((annotation: Annotation) => {
    setHoverId(annotation.id);
  }, []);

  const onAnnotationMouseOut = useCallback(() => {
    setHoverId(undefined);
  }, []);

  const annotations = useUnifiedFileViewerAnnotations({
    fileId,
    page,
    selectedAnnotations,
    pendingAnnotations,
    hoverId,
    onClick: onClickAnnotation,
    onMouseOver: onAnnotationMouseOver,
    onMouseOut: onAnnotationMouseOut,
  });

  const { annotationSearchResult } = usePnIdOCRResultFilterQuery(
    searchQuery,
    file,
    page
  );

  const displayedAnnotations = useMemo(() => {
    if (isAnnotationsShown) {
      return [
        ...getExtendedAnnotationsWithBadges(annotations),
        ...annotationSearchResult,
      ];
    }
    return [...annotationSearchResult];
  }, [isAnnotationsShown, annotations, annotationSearchResult]);

  const tooltips = useMemo(() => {
    if (!enableToolTips) {
      return [];
    }

    const focusedAnnotation = annotations.find(
      ({ id }) => String(id) === hoverId
    );
    if (!focusedAnnotation) {
      return undefined;
    }

    return [
      {
        targetId: String(focusedAnnotation?.id),
        content: <AnnotationHoverPreview annotation={focusedAnnotation} />,
        anchorTo: TooltipAnchorPosition.BOTTOM,
      },
    ];
  }, [enableToolTips, hoverId, annotations]);

  const onStageClick = useCallback(() => {
    setSelectedAnnotations([]);
  }, [setSelectedAnnotations]);

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

    const pendingAnnotation: ExtendedAnnotation = {
      ...annotation,
      metadata: {
        [ANNOTATION_SOURCE_KEY]: AnnotationSource.LOCAL,
        annotationType: 'diagrams.UnhandledTextObject',
        annotatedResourceType: 'file',
        annotatedResourceId: file.id,
        data: {
          text: '',
          textRegion: {
            xMin: annotation.x,
            yMin: annotation.y,
            xMax: annotation.x + annotation.width,
            yMax: annotation.y + annotation.height,
          },
          pageNumber: page,
        },
      },
    };

    setPendingAnnotations([pendingAnnotation]);
    setSelectedAnnotations([pendingAnnotation]);
  };

  const zoomToAnnotation = (annotation: ExtendedAnnotation) =>
    unifiedViewerRef?.zoomToAnnotationById(annotation.id, {
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

  const toolProps = creatable ? RectangleToolProps : NoopToolProps;

  return (
    <FullHeightWrapper>
      <FullHeightWrapper>
        <ReactUnifiedViewer
          applicationId={applicationId}
          id={id}
          setRef={ref => setUnifiedViewerRef(ref)}
          container={container}
          annotations={displayedAnnotations}
          tooltips={enableToolTips ? tooltips : undefined}
          onClick={onStageClick}
          shouldShowZoomControls={showControls}
          onAnnotationsUpdateRequest={handleAnnotationsUpdateRequest}
          {...toolProps}
        />
        <Pagination container={container} onPageChange={handlePageChange} />
        <ActionTools
          file={file}
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
