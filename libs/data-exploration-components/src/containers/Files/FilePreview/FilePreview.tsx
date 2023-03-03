import { FileInfo } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import ReactUnifiedViewer, {
  Annotation,
  AnnotationType,
  ContainerConfig,
  getCanonicalMimeType,
  getContainerConfigFromFileInfo,
  isSupportedFileInfo,
  ToolType,
  UnifiedViewer,
} from '@cognite/unified-file-viewer';
import { Loader } from '@data-exploration-components/components/index';
import useTooltips from '@data-exploration-components/containers/Files/FilePreview/useTooltips';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { ResourceItem } from '@data-exploration-components/types/index';
import { lightGrey } from '@data-exploration-components/utils/index';
import { DATA_EXPLORATION_COMPONENT } from '@data-exploration-components/constants/metrics';
import {
  useSearchResults,
  SearchResult,
} from '@data-exploration-lib/domain-layer';
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
} from '@data-exploration-lib/core';
import {
  getContainerId,
  getSearchResultAnnotationStyle,
  useDebouncedMetrics,
} from './utils';
import { FileContainerProps } from '@cognite/unified-file-viewer/dist/core/utils/getContainerConfigFromUrl';
import { Flex } from '@cognite/cogs.js';
import { useNumPages } from './hooks/useNumPages';
import { useCurrentSearchResult } from './hooks/useCurrentSearchResult';
import { useSearchBarState } from './hooks/useSearchBarState';
import noop from 'lodash/noop';

type FilePreviewProps = {
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
  filesAcl?: boolean;
  eventsAcl?: boolean;
  setEditMode?: () => void;
};

const RectangleToolProps = {
  tool: ToolType.RECTANGLE,
  toolOptions: {
    fill: 'transparent',
    strokeWidth: 4,
    stroke: 'black',
  },
};

const PanToolProps = {
  tool: ToolType.PAN,
};

const INITIAL_VIEWPORT_CENTER = {
  x: 0.5 * MAX_CONTAINER_WIDTH,
  y: 0.5 * MAX_CONTAINER_HEIGHT,
};
const INITIAL_VIEWPORT_SIZE = {
  width: 1.2 * MAX_CONTAINER_WIDTH,
  height: 1.2 * MAX_CONTAINER_HEIGHT,
};

export const FilePreview = ({
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
  filesAcl = false,
  eventsAcl = false,
  setEditMode = noop,
}: FilePreviewProps) => {
  const trackUsage = useDebouncedMetrics();
  const [unifiedViewerRef, setUnifiedViewerRef] = useState<UnifiedViewer>();
  const [page, setPage] = useState(1);
  const [container, setContainer] = useState<FileContainerProps>();
  const [hoverId, setHoverId] = useState<string | undefined>(undefined);
  const [pendingAnnotations, setPendingAnnotations] = useState<
    ExtendedAnnotation[]
  >([]);
  const [showResourcePreviewSidebar, setShowResourcePreviewSidebar] =
    React.useState<boolean>(false);
  const sdk = useSDK();

  const [isAnnotationsShown, setIsAnnotationsShown] = useState<boolean>(true);
  const [selectedAnnotations, setSelectedAnnotations] = useState<
    ExtendedAnnotation[]
  >([]);
  const numPages = useNumPages(container);

  const { data: file, isFetched: isFileFetched } = useCdfItem<FileInfo>(
    'files',
    {
      id: fileId,
    }
  );

  const {
    fileUrl,
    searchQuery,
    setSearchQuery,
    isSearchOpen,
    onSearchOpen,
    onSearchClose,
    setSearchBarInputRef,
  } = useSearchBarState({ file });

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

  useEffect(() => {
    (async () => {
      if (file && isSupportedFileInfo(file)) {
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
  }, [file, page, sdk]);

  const onClickAnnotation = useCallback(
    (annotation: ExtendedAnnotation) => {
      setShowResourcePreviewSidebar(true);
      setSelectedAnnotations((prevSelectedAnnotations) =>
        prevSelectedAnnotations.some(
          (prevSelectedAnnotation) =>
            prevSelectedAnnotation.id === annotation.id
        )
          ? []
          : [annotation]
      );
    },
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

  const { searchResults } = useSearchResults({
    file,
    query: searchQuery,
    enabled: showControls,
  });

  const { currentSearchResultIndex, onNextResult, onPreviousResult } =
    useCurrentSearchResult({ searchResults, page, setPage, unifiedViewerRef });

  useEffect(() => {
    if (searchQuery === '') {
      return;
    }

    const fileMimeType = file?.mimeType;
    trackUsage(
      DATA_EXPLORATION_COMPONENT.FILE_PREVIEW
        .SEARCH_IN_PAGE_SEARCH_VALUE_CHANGE,
      {
        fileId,
        // For privacy reasons not tracking actual search query or results
        searchQueryLength: searchQuery.length,
        searchResultLength: searchResults.length,
        mimeType:
          fileMimeType === undefined
            ? fileMimeType
            : getCanonicalMimeType(fileMimeType),
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackUsage, searchResults]);

  const displayedAnnotations = useMemo((): Annotation[] => {
    // We first highlight the current search result and then filter the annotations by page
    const filteredAnnotations = searchResults
      .map((searchResult, index): SearchResult => {
        // NOTE: The currentSearchResultIndex is 1-based, while the index is 0-based
        const isHighlighted = currentSearchResultIndex - 1 === index;

        return {
          page: searchResult.page,
          annotation: {
            ...searchResult.annotation,
            style: getSearchResultAnnotationStyle(isHighlighted),
          },
        };
      })
      .filter((searchResult) => searchResult.page === page)
      .map(({ annotation }) => annotation);

    if (isAnnotationsShown) {
      return [
        ...getExtendedAnnotationsWithBadges(annotations),
        ...filteredAnnotations,
      ];
    }
    return [...filteredAnnotations];
  }, [
    isAnnotationsShown,
    annotations,
    searchResults,
    currentSearchResultIndex,
    page,
  ]);

  const tooltips = useTooltips({
    isTooltipsEnabled: enableToolTips,
    // NOTE: Once support for annotations from Events API has been removed, we can
    // actually access the file id directly from the annotation. This does not work currently
    // though because the Event API annotations might not hav the file id set (and only the external id)
    fileId,
    annotations: annotations,
    hoverId: hoverId,
    selectedAnnotations: selectedAnnotations,
  });

  const onStageClick = useCallback(() => {
    setSelectedAnnotations([]);
  }, [setSelectedAnnotations]);

  const handleUpdateRequest = (update: {
    containers: ContainerConfig[];
    annotations: Annotation[];
  }) => {
    if (file === undefined) {
      return;
    }

    if (update.annotations.length === 0) {
      return;
    }

    const annotation = update.annotations[0];
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

  if (file !== undefined && !isSupportedFileInfo(file)) {
    return (
      <CenteredPlaceholder>
        <h1>No preview for this file type</h1>
      </CenteredPlaceholder>
    );
  }

  if (!isFileFetched || container === undefined || file === undefined) {
    return <Loader />;
  }

  const toolProps = creatable ? RectangleToolProps : PanToolProps;

  const handleOnKeyDown = (event: React.KeyboardEvent) => {
    if (event.code === 'ArrowLeft') {
      setPage((prevPage) => Math.max(prevPage - 1, 1));
    }
    if (event.code === 'ArrowRight') {
      setPage((prevPage) => Math.min(prevPage + 1, numPages));
    }

    if (event.key === 'f' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      onSearchOpen();
    }

    if (isSearchOpen) {
      if (event.key === 'Escape') {
        onSearchClose();
        return;
      }

      if (event.key === 'Enter') {
        if (event.shiftKey) {
          onPreviousResult();
          return;
        }
        onNextResult();
      }
    }
  };

  return (
    <FullHeightWrapper justifyContent="flex-end">
      <UFVWrapper>
        {/* We only want the keyboard events when the viewer is focused and not when the pagination is focused */}
        <UFVWrapper onKeyDown={handleOnKeyDown}>
          <ReactUnifiedViewer
            applicationId={applicationId}
            id={id}
            setRef={(ref) => setUnifiedViewerRef(ref)}
            container={container}
            annotations={displayedAnnotations}
            tooltips={enableToolTips ? tooltips : undefined}
            onClick={onStageClick}
            shouldShowZoomControls={showControls}
            onUpdateRequest={handleUpdateRequest}
            initialViewport={{
              ...INITIAL_VIEWPORT_CENTER,
              ...INITIAL_VIEWPORT_SIZE,
            }}
            {...toolProps}
          />
        </UFVWrapper>
        <Pagination
          currentPage={page}
          numPages={numPages}
          onPageChange={handlePageChange}
        />
        <ActionTools
          file={file}
          fileUrl={fileUrl}
          fileViewerRef={unifiedViewerRef}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isSearchOpen={isSearchOpen}
          onSearchOpen={onSearchOpen}
          onSearchClose={onSearchClose}
          setSearchBarInputRef={setSearchBarInputRef}
          currentSearchResultIndex={currentSearchResultIndex}
          numberOfSearchResults={searchResults.length}
          onNextResult={onNextResult}
          onPreviousResult={onPreviousResult}
          enableDownload={showDownload}
          enableSearch={showControls}
          showSideBar={showSideBar}
          showResourcePreviewSidebar={showResourcePreviewSidebar}
          setShowResourcePreviewSidebar={setShowResourcePreviewSidebar}
          editMode={creatable}
          setEditMode={setEditMode}
          filesAcl={filesAcl}
          eventsAcl={eventsAcl}
        />
      </UFVWrapper>
      {showSideBar && showResourcePreviewSidebar && (
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

const UFVWrapper = styled.div`
  display: flex;
  flex: 1;
  height: 100%;
  position: relative;
`;
const FullHeightWrapper = styled(Flex)`
  height: 100%;
`;

const SidebarWrapper = styled.div`
  box-sizing: content-box;
  height: 100%;
  max-width: 360px;
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
