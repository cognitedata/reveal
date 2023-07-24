import { useCallback, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

import { ContainerReference } from '../types';
import { getCanvasLink } from '../utils/getCanvasLink';

const INITIALIZE_WITH_CONTAINER_REFERENCES_PARAM_NAME =
  'initializeWithContainerReferences';

const getInitializeWithContainerReferencesFromSearchParams = (
  searchParams: URLSearchParams
): ContainerReference[] | undefined => {
  const initializeWithContainerReferencesParam = searchParams.get(
    INITIALIZE_WITH_CONTAINER_REFERENCES_PARAM_NAME
  );

  if (initializeWithContainerReferencesParam === null) {
    return undefined;
  }

  try {
    const parsedContainerReferences = JSON.parse(
      atob(initializeWithContainerReferencesParam)
    );

    if (!Array.isArray(parsedContainerReferences)) {
      return undefined;
    }

    return parsedContainerReferences;
  } catch (error) {
    return undefined;
  }
};

const removeInitializeWithContainerReferencesFromSearchParams = () => {
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.delete(INITIALIZE_WITH_CONTAINER_REFERENCES_PARAM_NAME);
  window.history.replaceState(
    {},
    '',
    `${window.location.pathname}?${searchParams.toString()}`
  );
};

const getCanvasIdFromSearchParams = (
  searchParams: URLSearchParams
): string | undefined => {
  const canvasId = searchParams.get('canvasId');

  if (canvasId === null) {
    return undefined;
  }

  return canvasId;
};

const useIndustryCanvasSearchParameters = () => {
  const [searchParams] = useSearchParams();
  const canvasId = getCanvasIdFromSearchParams(searchParams);
  const initializeWithContainerReferences = useRef<
    ContainerReference[] | undefined
  >(getInitializeWithContainerReferencesFromSearchParams(searchParams)).current;
  const [
    hasConsumedInitializeWithContainerReferences,
    setHasConsumedInitializeWithContainerReferences,
  ] = useState(false);
  const navigate = useNavigate();

  const setCanvasId = useCallback(
    (nextCanvasId: string | undefined, shouldReplace?: boolean) => {
      const url = getCanvasLink(nextCanvasId);
      navigate(url, {
        replace:
          canvasId === undefined || nextCanvasId === canvasId || shouldReplace,
      });
    },
    [navigate, canvasId]
  );

  const setHasConsumedInitializeWithContainerReferencesWrapper = useCallback(
    (nextHasConsumedInitializeWithContainerReferences: boolean) => {
      if (nextHasConsumedInitializeWithContainerReferences) {
        removeInitializeWithContainerReferencesFromSearchParams();
      }

      setHasConsumedInitializeWithContainerReferences(
        nextHasConsumedInitializeWithContainerReferences
      );
    },
    []
  );

  return {
    canvasId: getCanvasIdFromSearchParams(searchParams),
    setCanvasId,
    initializeWithContainerReferences,
    hasConsumedInitializeWithContainerReferences,
    setHasConsumedInitializeWithContainerReferences:
      setHasConsumedInitializeWithContainerReferencesWrapper,
  };
};

export default useIndustryCanvasSearchParameters;
