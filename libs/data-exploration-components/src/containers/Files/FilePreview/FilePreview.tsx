import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import styled from 'styled-components';

import { Loader } from '@data-exploration/components';
import noop from 'lodash/noop';

import { Flex } from '@cognite/cogs.js';
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
import type {
  PanToolConfig,
  RectangleToolConfig,
} from '@cognite/unified-file-viewer';
import { FileContainerProps } from '@cognite/unified-file-viewer/dist/core/utils/getContainerConfigFromUrl';

import {
  DATA_EXPLORATION_COMPONENT,
  ANNOTATION_SOURCE_KEY,
  AnnotationSource,
  ExtendedAnnotation,
  useDebouncedMetrics,
  useTranslation,
} from '@data-exploration-lib/core';
import {
  useSearchResults,
  SearchResult,
} from '@data-exploration-lib/domain-layer';

import { useIsDocumentsApiEnabled } from '../../../hooks';
import { ResourceItem } from '../../../types';
import { lightGrey } from '../../../utils';

import { ActionTools } from './ActionTools';
import { AnnotationPreviewSidebar } from './AnnotationPreviewSidebar';
import { MAX_CONTAINER_HEIGHT, MAX_CONTAINER_WIDTH } from './constants';
import getExtendedAnnotationsWithBadges from './getExtendedAnnotationsWithBadges';
import { useUnifiedFileViewerAnnotations } from './hooks';
import { useCurrentSearchResult } from './hooks/useCurrentSearchResult';
import { useNumPages } from './hooks/useNumPages';
import usePrevious from './hooks/usePrevious';
import { useSearchBarState } from './hooks/useSearchBarState';
import { Pagination } from './Pagination';
import useTooltips from './useTooltips';
import { getContainerId, getSearchResultAnnotationStyle } from './utils';

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
  annotationsAcl?: boolean;
  setEditMode?: () => void;
  hideEdit?: boolean;
};

const RECTANGLE_TOOL: RectangleToolConfig = {
  type: ToolType.RECTANGLE,
  fill: 'transparent',
  strokeWidth: 4,
  stroke: 'black',
};

const PAN_TOOL: PanToolConfig = {
  type: ToolType.PAN,
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
  annotationsAcl = false,
  setEditMode = noop,
  hideEdit = false,
}: FilePreviewProps) => {
  const { t } = useTranslation();
  const trackUsage = useDebouncedMetrics();
  const [unifiedViewerRef, setUnifiedViewerRef] = useState<UnifiedViewer>();

  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const pageFromUrl = query.get('page');

  const [page, setPage] = useState(pageFromUrl ? parseInt(pageFromUrl) : 1);
  useEffect(() => {
    if (pageFromUrl) {
      setPage(parseInt(pageFromUrl));
    }
  }, [pageFromUrl]);

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
  const isDocumentsApiEnabled = useIsDocumentsApiEnabled();

  const {
    fileUrl,
    searchQuery,
    setSearchQuery,
    isSearchOpen,
    onSearchOpen,
    onSearchClose,
    searchBarInputRef,
  } = useSearchBarState({ file });

  const previousSearchQuery = usePrevious(searchQuery);

  const zoomToAnnotationIfNotInViewport = useCallback(
    (annotation: ExtendedAnnotation) => {
      if (
        unifiedViewerRef?.isAnnotationInViewportById(annotation.id) === false
      ) {
        unifiedViewerRef.zoomToAnnotationById(annotation.id, {
          shouldKeepScale: true,
        });
      }
    },
    [unifiedViewerRef]
  );

  useEffect(() => {
    if (!enableZoomToAnnotation) {
      return;
    }
    if (selectedAnnotations.length !== 1) {
      return;
    }

    const [annotation] = selectedAnnotations;
    zoomToAnnotationIfNotInViewport(annotation);
  }, [
    selectedAnnotations,
    enableZoomToAnnotation,
    zoomToAnnotationIfNotInViewport,
  ]);

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
      if (file && isSupportedFileInfo(file, isDocumentsApiEnabled)) {
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

  const onAnnotationMouseOver = useCallback(
    (annotation: Annotation) => {
      if (creatable) {
        // Since you can't click on annotation in edit mode, we don't want to show hover state
        return;
      }

      setHoverId(annotation.id);
    },
    [creatable]
  );

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

  const searchResults = useSearchResults({
    file,
    query: searchQuery,
    enabled: showControls,
  });

  const { currentSearchResultIndex, onNextResult, onPreviousResult } =
    useCurrentSearchResult({
      searchResults: searchResults ?? [],
      page,
      setPage,
      unifiedViewerRef,
    });

  useEffect(() => {
    if (searchQuery === '' || searchQuery === previousSearchQuery) {
      return;
    }

    const fileMimeType = file?.mimeType;
    trackUsage(
      DATA_EXPLORATION_COMPONENT.FILE_PREVIEW.FIND_IN_DOCUMENT_VALUE_CHANGE,
      {
        fileId,
        // For privacy reasons not tracking actual search query or results
        searchQueryLength: searchQuery.length,
        searchResultLength: searchResults?.length,
        hasNoOcrData: searchResults === null,
        mimeType:
          fileMimeType === undefined
            ? fileMimeType
            : getCanonicalMimeType(fileMimeType),
      }
    );
  }, [
    trackUsage,
    searchResults,
    searchQuery,
    previousSearchQuery,
    file,
    fileId,
  ]);

  const displayedAnnotations = useMemo((): Annotation[] => {
    // We first highlight the current search result and then filter the annotations by page
    const filteredAnnotations = (searchResults ?? [])
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
    isTooltipsEnabled: enableToolTips && !creatable,
    // NOTE: Once support for annotations from Events API has been removed, we can
    // actually access the file id directly from the annotation. This does not work currently
    // though because the Event API annotations might not hav the file id set (and only the external id)
    fileId,
    annotations: annotations,
    hoverId: hoverId,
    selectedAnnotations: selectedAnnotations,
    selectAnnotation: (annotation: ExtendedAnnotation) => {
      setSelectedAnnotations([annotation]);
    },
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
    setShowResourcePreviewSidebar(true);

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

  const handlePageChange = (pageNumber: number) => setPage(pageNumber);

  if (file !== undefined && !isSupportedFileInfo(file, isDocumentsApiEnabled)) {
    return (
      <CenteredPlaceholder>
        <h1>{t('FILE_NO_PREVIEW_TEXT', 'No preview for this file type')}</h1>
      </CenteredPlaceholder>
    );
  }

  if (!isFileFetched || container === undefined || file === undefined) {
    return <Loader />;
  }

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
            containers={[container]}
            annotations={displayedAnnotations}
            tooltips={enableToolTips ? tooltips : undefined}
            onClick={onStageClick}
            shouldShowZoomControls={showControls}
            onUpdateRequest={handleUpdateRequest}
            tool={creatable ? RECTANGLE_TOOL : PAN_TOOL}
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
          hasOcrData={searchResults !== null}
          numberOfPages={numPages}
          isSearchOpen={isSearchOpen}
          onSearchOpen={onSearchOpen}
          onSearchClose={onSearchClose}
          searchBarInputRef={searchBarInputRef}
          currentSearchResultIndex={currentSearchResultIndex}
          numberOfSearchResults={searchResults?.length ?? 0}
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
          annotationsAcl={annotationsAcl}
          hideEdit={hideEdit}
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
            isDocumentsApiEnabled={isDocumentsApiEnabled}
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
  max-width: 380px;
  border-left: 1px solid ${lightGrey};
  background-color: white;
  overflow-y: auto;
`;

const CenteredPlaceholder = styled.div`
  justify-content: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  margin: 0 auto;
  text-align: center;
`;
