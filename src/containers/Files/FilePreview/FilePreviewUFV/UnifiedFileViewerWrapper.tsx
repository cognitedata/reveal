import ReactUnifiedViewer, {
  Annotation,
  ContainerType,
  getAnnotationsFromLegacyCogniteAnnotations,
  TooltipAnchorPosition,
  UnifiedViewer,
} from '@cognite/unified-file-viewer';
import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Pagination } from './Pagination';
import { ZoomingTools } from './ZoomingTools';
import styled from 'styled-components';
import { useFileDownloadUrl, useUnifiedFileViewerAnnotations } from './hooks';
import { CommonLegacyCogniteAnnotation } from './types';
import { PendingCogniteAnnotation } from '@cognite/annotations';
import { getContainerId } from './utils';
import { CogniteClient, FileInfo } from '@cognite/sdk';
import { Loader } from '../../../../components';
import {
  DEFAULT_CONTAINER_ID,
  MAX_CONTAINER_HEIGHT,
  MAX_CONTAINER_WIDTH,
} from './constants';
import { LegacyCogniteAnnotation } from '@cognite/unified-file-viewer/dist/core/utils/api';
import { ImageContainerProps } from '@cognite/unified-file-viewer/dist/core/containers/ImageContainer';
import { DocumentContainerProps } from '@cognite/unified-file-viewer/dist/core/containers/DocumentContainer';
import { ActionTools } from './ActionTools';
import { usePnIdOCRResultFilterQuery } from '../../../../domain/pnids/internal/hooks/usePnIdOCRResultFilterQuery';

type UnifiedFileViewerWrapperProps = {
  file: FileInfo;
  sdk: CogniteClient;
  creatable?: boolean;
  hideControls?: boolean;
  hideDownload?: boolean;
  hideSearch?: boolean;
  annotations: CommonLegacyCogniteAnnotation[];
  onSelectAnnotations?: (annotation: CommonLegacyCogniteAnnotation[]) => void;
  onCreateAnnotation?: (annotation: PendingCogniteAnnotation) => {};
  renderItemPreview?: (
    annotation: CommonLegacyCogniteAnnotation
  ) => ReactElement;
  renderAnnotation?: (
    el: CommonLegacyCogniteAnnotation,
    isSelected: boolean
  ) => Annotation | undefined;
  onRef?: (ref: UnifiedViewer | undefined) => void;
};

export const UnifiedFileViewerWrapper = ({
  file,
  annotations,
  hideControls = false,
  hideDownload = false,
  hideSearch = false,
  onSelectAnnotations,
  renderAnnotation,
  renderItemPreview,
  onRef,
}: UnifiedFileViewerWrapperProps) => {
  const [unifiedViewerRef, setUnifiedViewerRef] = useState<UnifiedViewer>();

  const [page, setPage] = useState(1);
  const [container, setContainer] = useState<
    DocumentContainerProps | ImageContainerProps
  >();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hoverId, setHoverId] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fileUrl = useFileDownloadUrl(file.id);

  const containerId = useMemo(() => {
    return getContainerId(file.id) || DEFAULT_CONTAINER_ID;
  }, [file.id]);

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
        } as ImageContainerProps);
      } else {
        setContainer({
          type: ContainerType.DOCUMENT,
          id: containerId,
          url: fileUrl,
          page,
          maxWidth: MAX_CONTAINER_WIDTH,
          maxHeight: MAX_CONTAINER_HEIGHT,
        } as DocumentContainerProps);
      }
    }
  }, [file.id, file.mimeType, fileUrl, page, containerId]);

  const renderStyledAnnotation = useCallback(
    (annotation: CommonLegacyCogniteAnnotation, isSelected: boolean) => {
      const legacyCogniteAnnotation = annotations.find(
        ({ id }) => String(id) === String(annotation.id)
      );
      if (renderAnnotation && legacyCogniteAnnotation) {
        return renderAnnotation(legacyCogniteAnnotation, isSelected);
      }
      const [ufvAnnotation] = getAnnotationsFromLegacyCogniteAnnotations([
        annotation as LegacyCogniteAnnotation,
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

  const { annotationSearchResult } = usePnIdOCRResultFilterQuery(
    searchQuery,
    containerId,
    file
  );

  const allConvertedAnnotations = useUnifiedFileViewerAnnotations({
    annotations,
    selectedIds,
    hoverId,
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
        anchorTo: TooltipAnchorPosition.BOTTOM,
      },
    ];
  }, [hoverId, annotations, renderItemPreview]);

  const handleRef = (ref: UnifiedViewer) => {
    if (onRef !== undefined) {
      onRef(ref);
    }

    setUnifiedViewerRef(ref);
  };

  if (!container) {
    return <Loader />;
  }

  return (
    <FullHeightWrapper>
      <Pagination container={container} onPageChange={handlePageNumber}>
        <ReactUnifiedViewer
          id="ufv-1"
          setRef={handleRef}
          container={container}
          annotations={[...allConvertedAnnotations, ...annotationSearchResult]}
          tooltips={tooltips}
          onClick={onStageClick}
        />
      </Pagination>
      <ActionTools
        file={file}
        fileUrl={fileUrl}
        fileViewerRef={unifiedViewerRef}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        enableDownload={!hideDownload}
        enableSearch={!hideSearch}
      />
      {!hideControls && <ZoomingTools fileViewerRef={unifiedViewerRef} />}
    </FullHeightWrapper>
  );
};

const FullHeightWrapper = styled.div`
  display: flex;
  flex: 1;
  height: 100%;
  position: relative;
`;
