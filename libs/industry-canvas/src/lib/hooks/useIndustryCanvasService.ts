import { useSDK } from '@cognite/sdk-provider';
import { useSearchParamString } from '@cognite/data-exploration';
import { useMemo, useCallback, useEffect } from 'react';
import { IndustryCanvasService } from '../services/IndustryCanvasService';
import { PersistedCanvasState, IndustryCanvasState } from '../types';
import { useCanvasSaveMutation } from './use-mutation/useCanvasSaveMutation';
import { useCanvasCreateMutation } from './use-mutation/useCanvasCreateMutation';
import { useGetCanvasByIdQuery } from './use-query/useGetCanvasByIdQuery';
import { useListCanvases } from './use-query/useListCanvases';
import { useCanvasArchiveMutation } from './use-mutation/useCanvasArchiveMutation';

export type UseIndustryCanvasManagerReturnType = {
  activeCanvas: PersistedCanvasState | undefined;
  canvases: PersistedCanvasState[];
  canvasService: IndustryCanvasService;
  saveCanvas: (canvas: PersistedCanvasState) => Promise<void>;
  createCanvas: (canvas: IndustryCanvasState) => Promise<PersistedCanvasState>;
  archiveCanvas: (canvas: PersistedCanvasState) => Promise<void>;
  isCreatingCanvas: boolean;
  isSavingCanvas: boolean;
  isLoadingCanvas: boolean;
  isListingCanvases: boolean;
  isArchivingCanvas: boolean;
};

export const useIndustryCanvasService =
  (): UseIndustryCanvasManagerReturnType => {
    const sdk = useSDK();
    const canvasService = useMemo(() => new IndustryCanvasService(sdk), [sdk]);
    const [canvasId, setCanvasId] = useSearchParamString('canvasId');
    const { data: activeCanvas, isLoading: isLoadingCanvas } =
      useGetCanvasByIdQuery(canvasService, canvasId);
    const { mutateAsync: saveCanvas, isLoading: isSavingCanvas } =
      useCanvasSaveMutation(canvasService);
    const { mutateAsync: createCanvas, isLoading: isCreatingCanvas } =
      useCanvasCreateMutation(canvasService);
    const { mutateAsync: archiveCanvas, isLoading: isArchivingCanvas } =
      useCanvasArchiveMutation(canvasService);
    const {
      data: canvases,
      isLoading: isListingCanvases,
      refetch: refetchCanvases,
    } = useListCanvases(canvasService);

    // Initialize the page with a new and empty canvas if the canvasId query
    // parameter is not provided. This is so that the user immediately can have
    // their changes persisted once they open up the IC page
    useEffect(() => {
      const createInitialCanvas = async () => {
        if (canvasId === null && !isCreatingCanvas) {
          const initialCanvas = canvasService.makeEmptyCanvas();
          setCanvasId(initialCanvas.externalId);
          await createCanvas(initialCanvas);
          refetchCanvases();
        }
      };
      createInitialCanvas();
    }, [
      canvasId,
      isCreatingCanvas,
      canvasService,
      createCanvas,
      refetchCanvases,
      setCanvasId,
    ]);

    const saveCanvasWrapper = useCallback(
      async (canvas: PersistedCanvasState) => {
        const updatedCanvas = await saveCanvas({
          ...(activeCanvas ?? {}),
          ...canvas,
        });
        setCanvasId(updatedCanvas.externalId);
      },
      [activeCanvas, saveCanvas, setCanvasId]
    );

    const createCanvasWrapper = useCallback(
      async (canvas: IndustryCanvasState) => {
        const newCanvas = await createCanvas(canvas);
        setCanvasId(newCanvas.externalId);
        refetchCanvases();
        return newCanvas;
      },
      [createCanvas, refetchCanvases, setCanvasId]
    );

    const archiveCanvasWrapper = useCallback(
      async (canvasToArchive: PersistedCanvasState) => {
        await archiveCanvas(canvasToArchive);
        if (canvasToArchive.externalId === activeCanvas?.externalId) {
          const nextCanvas = canvases?.find(
            (canvas) => canvas.externalId !== canvasToArchive.externalId
          );
          setCanvasId(nextCanvas === undefined ? null : nextCanvas.externalId);
        }
        await refetchCanvases();
      },
      [activeCanvas, canvases, archiveCanvas, refetchCanvases, setCanvasId]
    );
    return {
      activeCanvas,
      canvases: canvases ?? [],
      canvasService,
      isCreatingCanvas,
      isSavingCanvas,
      isLoadingCanvas,
      isListingCanvases,
      isArchivingCanvas,
      createCanvas: createCanvasWrapper,
      saveCanvas: saveCanvasWrapper,
      archiveCanvas: archiveCanvasWrapper,
    };
  };
