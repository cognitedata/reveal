import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';

import { useSDK } from '@cognite/sdk-provider';

import { useCanvasArchiveMutation } from '../hooks/use-mutation/useCanvasArchiveMutation';
import { useCanvasCreateMutation } from '../hooks/use-mutation/useCanvasCreateMutation';
import { useCanvasSaveMutation } from '../hooks/use-mutation/useCanvasSaveMutation';
import { useGetCanvasByIdQuery } from '../hooks/use-query/useGetCanvasByIdQuery';
import { useListCanvases } from '../hooks/use-query/useListCanvases';
import { useUserProfileContext } from '../hooks/use-query/useUserProfile';
import { IndustryCanvasService } from '../services/IndustryCanvasService';
import {
  ContainerReference,
  IndustryCanvasState,
  SerializedCanvasDocument,
} from '../types';
import { serializeCanvasState } from '../utils/utils';

import useIndustryCanvasSearchParameters from './useIndustryCanvasSearchParameters';

export type IndustryCanvasContextType = {
  activeCanvas: SerializedCanvasDocument | undefined;
  canvases: SerializedCanvasDocument[];
  canvasService: IndustryCanvasService | undefined;
  saveCanvas: (canvas: SerializedCanvasDocument) => Promise<void>;
  createCanvas: (
    canvas: IndustryCanvasState
  ) => Promise<SerializedCanvasDocument>;
  archiveCanvas: (canvas: SerializedCanvasDocument) => Promise<void>;
  isCreatingCanvas: boolean;
  isSavingCanvas: boolean;
  isLoadingCanvas: boolean;
  isListingCanvases: boolean;
  isArchivingCanvas: boolean;
  initializeWithContainerReferences: ContainerReference[] | undefined;
  setCanvasId: (canvasId: string) => void;
};

export const IndustryCanvasContext = createContext<IndustryCanvasContextType>({
  activeCanvas: undefined,
  canvases: [],
  canvasService: undefined,
  saveCanvas: () => {
    throw new Error('saveCanvas called before initialisation');
  },
  createCanvas: () => {
    throw new Error('createCanvas called before initialisation');
  },
  archiveCanvas: () => {
    throw new Error('archiveCanvas called before initialisation');
  },
  setCanvasId: () => {
    throw new Error('setCanvasId called before initialisation');
  },
  isCreatingCanvas: false,
  isSavingCanvas: false,
  isLoadingCanvas: false,
  isListingCanvases: false,
  isArchivingCanvas: false,
  initializeWithContainerReferences: undefined,
});

type IndustryCanvasProviderProps = {
  children: React.ReactNode;
};
export const IndustryCanvasProvider: React.FC<IndustryCanvasProviderProps> = ({
  children,
}): JSX.Element => {
  const sdk = useSDK();
  const { userProfile } = useUserProfileContext();
  const canvasService = useMemo(
    () => new IndustryCanvasService(sdk, userProfile),
    [sdk, userProfile]
  );
  const { canvasId, setCanvasId, initializeWithContainerReferences } =
    useIndustryCanvasSearchParameters();

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
  // TODO: can/should this useEffect be removed once we have the canvas management in place?
  useEffect(() => {
    const createInitialCanvas = async () => {
      if (canvasId === undefined && !isCreatingCanvas) {
        const initialCanvas = canvasService.makeEmptyCanvas();
        const createdCanvas = await createCanvas(initialCanvas);
        setCanvasId(createdCanvas.externalId);
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
    async (canvasDocument: SerializedCanvasDocument) => {
      await saveCanvas(canvasDocument);
    },
    [saveCanvas, setCanvasId]
  );

  const createCanvasWrapper = useCallback(
    async (canvas: IndustryCanvasState) => {
      const newCanvas = await createCanvas({
        ...canvasService.makeEmptyCanvas(),
        data: serializeCanvasState(canvas),
      });
      setCanvasId(newCanvas.externalId);
      refetchCanvases();
      return newCanvas;
    },
    [canvasService, createCanvas, refetchCanvases, setCanvasId]
  );

  const archiveCanvasWrapper = useCallback(
    async (canvasToArchive: SerializedCanvasDocument) => {
      await archiveCanvas(canvasToArchive);
      if (canvasToArchive.externalId === activeCanvas?.externalId) {
        const nextCanvas = canvases?.find(
          (canvas) => canvas.externalId !== canvasToArchive.externalId
        );
        setCanvasId(nextCanvas?.externalId, true);
      }
      await refetchCanvases();
    },
    [activeCanvas, canvases, archiveCanvas, refetchCanvases, setCanvasId]
  );

  return (
    <IndustryCanvasContext.Provider
      value={{
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
        initializeWithContainerReferences,
        setCanvasId,
      }}
    >
      {children}
    </IndustryCanvasContext.Provider>
  );
};

export const useIndustryCanvasContext = (): IndustryCanvasContextType =>
  useContext(IndustryCanvasContext);
