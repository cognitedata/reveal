import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { ContainerReference } from '../types';
import { getCanvasLink } from '../utils/getCanvasLink';

const getInitializeWithContainerReferencesFromSearchParams = (
  searchParams: URLSearchParams
): ContainerReference[] | undefined => {
  const initializeWithContainerReferencesParam = searchParams.get(
    'initializeWithContainerReferences'
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

  return {
    canvasId: getCanvasIdFromSearchParams(searchParams),
    setCanvasId,
    initializeWithContainerReferences,
  };
};

export default useIndustryCanvasSearchParameters;
