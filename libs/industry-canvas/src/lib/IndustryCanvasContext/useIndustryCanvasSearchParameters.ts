import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import usePrevious from '../hooks/usePrevious';
import { ContainerReference } from '../types';

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
  const [searchParams, setSearchParams] = useSearchParams();
  const [canvasId, setCanvasId] = useState<string | undefined>(
    getCanvasIdFromSearchParams(searchParams)
  );
  const previousCanvasId = usePrevious(canvasId);
  const initializeWithContainerReferences = useRef<
    ContainerReference[] | undefined
  >(getInitializeWithContainerReferencesFromSearchParams(searchParams)).current;

  useEffect(() => {
    if (!searchParams.has('initializeWithContainerReferences')) {
      return;
    }

    setSearchParams(
      (prevParams) => {
        const nextParams = new URLSearchParams(prevParams);

        if (nextParams.has('initializeWithContainerReferences')) {
          nextParams.delete('initializeWithContainerReferences');
        }

        return nextParams;
      },
      {
        replace: true,
      }
    );
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    setSearchParams(
      (prevParams) => {
        const nextParams = new URLSearchParams(prevParams);
        if (nextParams.has('initializeWithContainerReferences')) {
          nextParams.delete('initializeWithContainerReferences');
        }

        if (canvasId === undefined) {
          nextParams.delete('canvasId');
        } else {
          nextParams.set('canvasId', canvasId);
        }
        return nextParams;
      },
      {
        replace:
          previousCanvasId === undefined || canvasId === previousCanvasId,
      }
    );
  }, [canvasId, previousCanvasId, setSearchParams]);

  return {
    canvasId,
    setCanvasId,
    initializeWithContainerReferences,
  };
};

export default useIndustryCanvasSearchParameters;
