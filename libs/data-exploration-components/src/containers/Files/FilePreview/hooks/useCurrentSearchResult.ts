import { useState, useEffect, useCallback } from 'react';

import { SearchResult } from '@data-exploration-lib/domain-layer';
import {
  UnifiedViewer,
  UnifiedViewerEventType,
} from '@cognite/unified-file-viewer';
import usePrevious from './usePrevious';
import {
  DATA_EXPLORATION_COMPONENT,
  useMetrics,
} from '@data-exploration-lib/core';

type UseCurrentSearchResultProps = {
  searchResults: SearchResult[];
  page: number;
  setPage: (page: number) => void;
  unifiedViewerRef: UnifiedViewer | undefined;
};

export type UseCurrentSearchResultState = {
  currentSearchResultIndex: number;
  onNextResult: () => void;
  onPreviousResult: () => void;
};

export const useCurrentSearchResult = ({
  searchResults,
  page,
  setPage,
  unifiedViewerRef,
}: UseCurrentSearchResultProps) => {
  const [currentSearchResultIndex, setCurrentSearchResultIndex] = useState(0);
  const prevSearchResults = usePrevious(searchResults);
  const prevCurrentSearchResultIndex = usePrevious(currentSearchResultIndex);
  const trackUsage = useMetrics();

  const zoomToAnnotationIfNotInViewport = useCallback(
    (searchResult: SearchResult) => {
      const annotationId = searchResult.annotation.id;
      if (!unifiedViewerRef?.isAnnotationInViewportById(annotationId)) {
        unifiedViewerRef?.zoomToAnnotationById(annotationId, {
          shouldKeepScale: true,
          duration: 0.0,
        });
      }
    },
    [unifiedViewerRef]
  );

  const navigateToSearchResult = useCallback(
    (searchResult: SearchResult) => {
      if (searchResult.page === page) {
        zoomToAnnotationIfNotInViewport(searchResult);
        return;
      }

      unifiedViewerRef?.once(UnifiedViewerEventType.ON_CONTAINER_LOAD, () =>
        zoomToAnnotationIfNotInViewport(searchResult)
      );
      setPage(searchResult.page);
    },
    [page, setPage, unifiedViewerRef, zoomToAnnotationIfNotInViewport]
  );

  // Update the current search result index if the search results have changed
  useEffect(() => {
    setCurrentSearchResultIndex(searchResults.length > 0 ? 1 : 0);
  }, [searchResults]);

  // Make sure the current search result is visible
  useEffect(() => {
    if (
      searchResults === prevSearchResults &&
      currentSearchResultIndex === prevCurrentSearchResultIndex
    ) {
      return;
    }

    const searchResult = searchResults[currentSearchResultIndex - 1];
    if (searchResult === undefined) {
      return;
    }

    navigateToSearchResult(searchResult);
  }, [
    currentSearchResultIndex,
    prevCurrentSearchResultIndex,
    searchResults,
    prevSearchResults,
    navigateToSearchResult,
  ]);

  const onNextResult = () => {
    if (searchResults.length === 0) {
      return;
    }

    if (searchResults.length === 1) {
      navigateToSearchResult(searchResults[0]);
      return;
    }

    const nextIndex =
      currentSearchResultIndex >= searchResults.length
        ? 1
        : currentSearchResultIndex + 1;

    trackUsage(
      DATA_EXPLORATION_COMPONENT.FILE_PREVIEW.FIND_IN_DOCUMENT_NEXT_RESULT,
      {
        nextIndex: nextIndex,
        searchResultLength: searchResults.length,
      }
    );

    setCurrentSearchResultIndex(nextIndex);
  };

  const onPreviousResult = () => {
    if (searchResults.length === 0) {
      return;
    }

    if (searchResults.length === 1) {
      navigateToSearchResult(searchResults[0]);
      return;
    }

    const nextIndex =
      currentSearchResultIndex <= 1
        ? searchResults.length
        : currentSearchResultIndex - 1;

    setCurrentSearchResultIndex(nextIndex);
  };

  return {
    currentSearchResultIndex,
    onNextResult,
    onPreviousResult,
  };
};
