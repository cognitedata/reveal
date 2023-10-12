import { useEffect, useRef } from 'react';

import debounce from 'lodash/debounce';

import { useSDK } from '@cognite/sdk-provider';
import { IdsByType } from '@cognite/unified-file-viewer';

import { useIndustryCanvasContext } from '../IndustryCanvasContext/index';
import { replaceHistory } from '../state/useIndustrialCanvasStore';
import {
  IndustryCanvasState,
  isCommentAnnotation,
  SerializedCanvasDocument,
  SerializedIndustryCanvasState,
} from '../types';
import { deepEqualWithMissingProperties } from '../utils/deepEqualWithMissingProperties';
import {
  deserializeCanvasDocument,
  getRemovedIdsByType,
  serializeCanvasState,
} from '../utils/utils';

const SAVE_CANVAS_DEBOUNCE_TIME_MS = 700;
const debouncedSaveCanvas = debounce(
  async (
    activeCanvas: SerializedCanvasDocument,
    serializedData: SerializedIndustryCanvasState,
    saveCanvas: (canvas: SerializedCanvasDocument) => Promise<void>,
    deleteCanvasIdsByType: ({
      ids,
      canvasExternalId,
    }: {
      ids: IdsByType;
      canvasExternalId: string;
    }) => Promise<void>
  ) => {
    // Delete the annotations and containers nodes that have been removed from the canvas
    await deleteCanvasIdsByType({
      canvasExternalId: activeCanvas.externalId,
      ids: getRemovedIdsByType(activeCanvas.data, serializedData),
    });
    await saveCanvas({
      ...activeCanvas,
      data: serializedData,
    });
  },
  SAVE_CANVAS_DEBOUNCE_TIME_MS
);
const useAutoSaveState = (
  canvasState: IndustryCanvasState,
  hasFinishedInitialLoad: boolean,
  activeCanvas: SerializedCanvasDocument | undefined,
  saveCanvas: (canvas: SerializedCanvasDocument) => Promise<void>,
  deleteCanvasIdsByType: ({
    ids,
    canvasExternalId,
  }: {
    ids: IdsByType;
    canvasExternalId: string;
  }) => Promise<void>
) => {
  useEffect(() => {
    if (!hasFinishedInitialLoad || activeCanvas === undefined) {
      return;
    }

    const filteredNodes = canvasState.nodes.filter(
      (node) => !isCommentAnnotation(node)
    );
    const serializedData = serializeCanvasState({
      ...canvasState,
      nodes: filteredNodes,
    });
    if (deepEqualWithMissingProperties(serializedData, activeCanvas.data)) {
      return;
    }

    debouncedSaveCanvas(
      activeCanvas,
      serializedData,
      saveCanvas,
      deleteCanvasIdsByType
    );
    // activeCanvas will change with every save, so we don't want to include it in the dependency array
    // if included, it will lead to an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasState, saveCanvas, hasFinishedInitialLoad]);
};
const useAutoLoadState = (
  activeCanvas: SerializedCanvasDocument | undefined
) => {
  const sdk = useSDK();
  const hasFinishedInitialLoad = useRef<boolean>(false);
  const activeCanvasExternalId = activeCanvas?.externalId;
  useEffect(() => {
    if (activeCanvasExternalId === undefined) {
      return;
    }
    hasFinishedInitialLoad.current = false;
  }, [activeCanvasExternalId]);

  useEffect(() => {
    if (activeCanvas === undefined || hasFinishedInitialLoad.current) {
      return;
    }
    (async () => {
      const deserializedCanvasDocument = await deserializeCanvasDocument(
        sdk,
        activeCanvas
      );
      replaceHistory(deserializedCanvasDocument.data);
      hasFinishedInitialLoad.current = true;
    })();
  }, [activeCanvas, replaceHistory, sdk]);

  return {
    hasFinishedInitialLoad: hasFinishedInitialLoad.current,
  };
};
const usePersistence = (canvasState: IndustryCanvasState) => {
  const { activeCanvas, saveCanvas, deleteCanvasIdsByType } =
    useIndustryCanvasContext();
  const { hasFinishedInitialLoad } = useAutoLoadState(activeCanvas);
  useAutoSaveState(
    canvasState,
    hasFinishedInitialLoad,
    activeCanvas,
    saveCanvas,
    deleteCanvasIdsByType
  );
};

export default usePersistence;
