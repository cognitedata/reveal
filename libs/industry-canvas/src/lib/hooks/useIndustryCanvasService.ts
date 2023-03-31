import { useSDK } from '@cognite/sdk-provider';
import { useSearchParamString } from '@cognite/data-exploration';
import { useMemo, useCallback, useEffect } from 'react';
import { IndustryCanvasService } from '../services/IndustryCanvasService';
import { PersistedCanvasState, IndustryCanvasState } from '../types';
import { useCanvasSaveMutation } from './use-mutation/useCanvasSaveMutation';
import { useCanvasCreateMutation } from './use-mutation/useCanvasCreateMutation';
import { useGetCanvasByIdQuery } from './use-query/useGetCanvasByIdQuery';

export type UseIndustryCanvasManagerReturnType = {
  activeCanvas: PersistedCanvasState | undefined;
  canvasService: IndustryCanvasService;
  saveCanvas: (canvas: PersistedCanvasState) => Promise<void>;
  createCanvas: (canvas: IndustryCanvasState) => Promise<PersistedCanvasState>;
  isCreatingCanvas: boolean;
  isSavingCanvas: boolean;
  isLoadingCanvas: boolean;
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

    // Initialize the page with a new and empty canvas if the canvasId query
    // parameter is not provided. This is so that the user immediately can have
    // their changes persisted once they open up the IC page
    useEffect(() => {
      const createInitialCanvas = async () => {
        if (canvasId === null) {
          const initialCanvas = await createCanvas({
            containerReferences: [],
            canvasAnnotations: [],
          });
          setCanvasId(initialCanvas.externalId);
        }
      };
      createInitialCanvas();
    }, []);

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
        return newCanvas;
      },
      [createCanvas, setCanvasId]
    );

    return {
      activeCanvas,
      canvasService,
      isCreatingCanvas,
      isSavingCanvas,
      isLoadingCanvas,
      saveCanvas: saveCanvasWrapper,
      createCanvas: createCanvasWrapper,
    };
  };
