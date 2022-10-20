import ReactUnifiedViewer, {
  Annotation,
  ContainerConfig,
  ContainerType,
  getAnnotationsFromLegacyCogniteAnnotations,
  UnifiedViewer,
} from '@cognite/unified-file-viewer';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pagination } from './Pagination';
import { ZoomingTools } from './ZoomingTools';
import styled from 'styled-components';
import { useFileDownloadUrl, useUnifiedFileViewerAnnotations } from './hooks';
import { CommonLegacyCogniteAnnotation } from './types';
import { PendingCogniteAnnotation } from '@cognite/annotations';
import { getContainerId } from './utils';
import { CogniteClient, FileInfo } from '@cognite/sdk';
import { Loader } from '../../../../components';
import { MAX_CONTAINER_HEIGHT, MAX_CONTAINER_WIDTH } from './constants';

export type UnifiedFileViewerWrapperProps = {
  file: FileInfo;
  sdk: CogniteClient;
  creatable?: boolean;
  hoverable?: boolean;
  hideZoomControls: boolean;
  annotations: CommonLegacyCogniteAnnotation[];
  onSelectAnnotations?: (annotation: CommonLegacyCogniteAnnotation[]) => void;
  zoomOnAnnotation?: {
    annotation: CommonLegacyCogniteAnnotation;
    scale: number;
  };
  onCreateAnnotation?: (annotation: PendingCogniteAnnotation) => {};
  renderItemPreview?: (
    annotation: CommonLegacyCogniteAnnotation
  ) => React.ReactNode;
  renderAnnotation?: (
    el: CommonLegacyCogniteAnnotation,
    isSelected: boolean
  ) => Annotation;
};

export const UnifiedFileViewerWrapper = ({
  file,
  annotations,
  hoverable = true,
  hideZoomControls = false,
  zoomOnAnnotation,
  onSelectAnnotations,
  renderAnnotation,
  renderItemPreview,
}: UnifiedFileViewerWrapperProps) => {
  const containerId = getContainerId(file.id);

  const [ref, setRef] = useState<UnifiedViewer | null>();

  const [zoomControlsHidden] = useState(hideZoomControls);
  const [page, setPage] = useState(1);
  const [container, setContainer] = useState<ContainerConfig>({
    id: containerId,
    maxWidth: MAX_CONTAINER_WIDTH,
    maxHeight: MAX_CONTAINER_HEIGHT,
  });
  const [selectedIds, setSelectedIds] = useState<string[]>(
    zoomOnAnnotation?.annotation
      ? [String(zoomOnAnnotation?.annotation.id)]
      : []
  );
  const [hoverId, setHoverId] = useState<string | undefined>(undefined);
  const fileUrl = useFileDownloadUrl(file.id);

  useEffect(() => {
    setContainer((prevState: ContainerConfig) => ({ ...prevState, page }));
  }, [page]);

  useEffect(() => {
    if (file.id && file.mimeType && fileUrl) {
      if (file.mimeType !== 'application/pdf') {
        setContainer({
          type: ContainerType.IMAGE,
          id: containerId,
          url: fileUrl,
          page,
          maxWidth: MAX_CONTAINER_WIDTH,
          maxHeight: MAX_CONTAINER_HEIGHT,
        });
      } else {
        setContainer({
          type: ContainerType.DOCUMENT,
          id: containerId,
          url: fileUrl,
          page,
          maxWidth: MAX_CONTAINER_WIDTH,
          maxHeight: MAX_CONTAINER_HEIGHT,
        });
      }
    }
  }, [file.id, file.mimeType, fileUrl, page, containerId]);

  const {
    annotation: { id },
    scale,
  } = zoomOnAnnotation || { annotation: {} };

  const zoomTo = useCallback(
    (id: string, scale: number) => {
      if (ref) {
        ref.zoomToAnnotationById(id, {
          scale,
        });
      }
    },
    [ref]
  );

  // zoom to annotation when provided externally
  useEffect(() => {
    if (id && scale) {
      zoomTo(String(id), scale);
    }
  }, [id, scale, zoomTo]);

  const renderStyledAnnotation = useCallback(
    (annotation: CommonLegacyCogniteAnnotation, isSelected: boolean) => {
      const legacyCogniteAnnotation = annotations.find(
        ({ id }) => String(id) === String(annotation.id)
      );
      if (renderAnnotation && legacyCogniteAnnotation) {
        return renderAnnotation(legacyCogniteAnnotation, isSelected);
      }
      const [ufvAnnotation] = getAnnotationsFromLegacyCogniteAnnotations([
        annotation,
      ]);
      return ufvAnnotation;
    },
    [annotations, renderAnnotation]
  );

  const onClickAnnotation = useCallback(
    ({ id }: Annotation) => {
      let updatedSelectedIds: string[];
      if (selectedIds.includes(id)) {
        updatedSelectedIds = selectedIds.filter(
          selectedAnnotationId => selectedAnnotationId !== id
        );
      } else {
        updatedSelectedIds = [id];
      }
      const legacyCogniteAnnotations = annotations.filter(cogniteAnn =>
        updatedSelectedIds.includes(String(cogniteAnn.id))
      );
      if (onSelectAnnotations) {
        onSelectAnnotations(legacyCogniteAnnotations || []);
      }
      setSelectedIds(updatedSelectedIds);
    },
    [onSelectAnnotations, annotations, selectedIds]
  );

  const onMouseOver = useCallback((annotation: Annotation) => {
    setHoverId(annotation.id);
  }, []);
  const onMouseLeave = useCallback(() => {
    setHoverId(undefined);
  }, []);

  const onStageClick = useCallback(() => {
    if (onSelectAnnotations) {
      onSelectAnnotations([]);
    }
    setSelectedIds([]);
  }, [onSelectAnnotations]);

  const allConvertedAnnotations = useUnifiedFileViewerAnnotations({
    annotations,
    selectedIds,
    hoverId,
    hoverable,
    onClick: onClickAnnotation,
    onMouseEnter: onMouseOver,
    onMouseLeave,
    renderAnnotation: renderStyledAnnotation,
  });

  const handlePageNumber = (pageNumber: number) => {
    setPage(pageNumber);
  };

  const tooltips = useMemo(() => {
    const focusedAnnotation = annotations.find(
      ({ id }) => String(id) === hoverId
    );
    if (!renderItemPreview || !focusedAnnotation) {
      return undefined;
    }

    return [
      {
        targetId: String(focusedAnnotation?.id),
        content: renderItemPreview!(focusedAnnotation!),
        anchorTo: 'bottom',
      },
    ];
  }, [hoverId, annotations, renderItemPreview]);

  if (!container) {
    return <Loader />;
  }

  return (
    <FullHeightWrapper>
      <Pagination pdfUrl={container?.url} onPageChange={handlePageNumber}>
        <ReactUnifiedViewer
          id="ufv-1"
          setRef={setRef}
          container={container}
          annotations={allConvertedAnnotations}
          tooltips={tooltips}
          onClick={onStageClick}
        />
      </Pagination>
      {!zoomControlsHidden && <ZoomingTools fileViewerRef={ref} />}
    </FullHeightWrapper>
  );
};

const FullHeightWrapper = styled.div`
  display: flex;
  flex: 1;
  height: 100%;
  position: relative;
`;
