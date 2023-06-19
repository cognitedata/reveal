import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';

import { useSDK } from '@cognite/sdk-provider';
import { IdsByType } from '@cognite/unified-file-viewer';

import { MetricEvent } from '../constants';
import { useCanvasArchiveMutation } from '../hooks/use-mutation/useCanvasArchiveMutation';
import { useCanvasCreateMutation } from '../hooks/use-mutation/useCanvasCreateMutation';
import { useCanvasSaveMutation } from '../hooks/use-mutation/useCanvasSaveMutation';
import { useDeleteCanvasIdsByTypeMutation } from '../hooks/use-mutation/useDeleteCanvasIdsByTypeMutation';
import { useGetCanvasByIdQuery } from '../hooks/use-query/useGetCanvasByIdQuery';
import { useListCanvases } from '../hooks/use-query/useListCanvases';
import { IndustryCanvasService } from '../services/IndustryCanvasService';
import {
  ContainerReference,
  IndustryCanvasState,
  SerializedCanvasDocument,
} from '../types';
import { useUserProfile } from '../UserProfileProvider';
import useMetrics from '../utils/tracking/useMetrics';
import { serializeCanvasState } from '../utils/utils';

import useCanvasLocking from './useCanvasLocking';
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
  deleteCanvasIdsByType: ({
    ids,
    canvasExternalId,
  }: {
    ids: IdsByType;
    canvasExternalId: string;
  }) => Promise<void>;
  isCreatingCanvas: boolean;
  isSavingCanvas: boolean;
  isLoadingCanvas: boolean;
  isListingCanvases: boolean;
  isArchivingCanvas: boolean;
  initializeWithContainerReferences: ContainerReference[] | undefined;
  setCanvasId: (canvasId: string) => void;
  isCanvasLocked: boolean;
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
  deleteCanvasIdsByType: () => {
    throw new Error('deleteCanvasIdsByType called before initialisation');
  },
  isCreatingCanvas: false,
  isSavingCanvas: false,
  isLoadingCanvas: false,
  isListingCanvases: false,
  isArchivingCanvas: false,
  initializeWithContainerReferences: undefined,
  isCanvasLocked: false,
});

type IndustryCanvasProviderProps = {
  children: React.ReactNode;
};
export const IndustryCanvasProvider: React.FC<IndustryCanvasProviderProps> = ({
  children,
}): JSX.Element => {
  const sdk = useSDK();
  const trackUsage = useMetrics();
  const { userProfile } = useUserProfile();
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
  const { mutateAsync: deleteCanvasIdsByType } =
    useDeleteCanvasIdsByTypeMutation(canvasService);
  const {
    data: canvases,
    isLoading: isListingCanvases,
    refetch: refetchCanvases,
  } = useListCanvases(canvasService);

  const { isCanvasLocked } = useCanvasLocking(
    canvasId,
    canvasService,
    userProfile
  );

  const saveCanvasWrapper = useCallback(
    async (canvasDocument: SerializedCanvasDocument) => {
      if (isCanvasLocked) {
        return;
      }

      await saveCanvas(canvasDocument);
    },
    [saveCanvas, isCanvasLocked]
  );

  // Initialize the page with a new and empty canvas if the canvasId query
  // parameter is not provided. This path is primarily used for the
  // "Open in Canvas" button in DE.
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

  const createCanvasWrapper = useCallback(
    async (canvas: IndustryCanvasState) => {
      const newCanvas = await createCanvas({
        ...canvasService.makeEmptyCanvas(),
        data: serializeCanvasState(canvas),
      });
      refetchCanvases();
      trackUsage(MetricEvent.CANVAS_CREATED);
      return newCanvas;
    },
    [canvasService, createCanvas, refetchCanvases, trackUsage]
  );

  const archiveCanvasWrapper = useCallback(
    async (canvasToArchive: SerializedCanvasDocument) => {
      if (isCanvasLocked) {
        return;
      }

      await archiveCanvas(canvasToArchive);
      if (canvasToArchive.externalId === activeCanvas?.externalId) {
        const nextCanvas = canvases?.find(
          (canvas) => canvas.externalId !== canvasToArchive.externalId
        );
        setCanvasId(nextCanvas?.externalId, true);
      }
      await refetchCanvases();
      trackUsage(MetricEvent.CANVAS_ARCHIVED);
    },
    [
      activeCanvas,
      canvases,
      archiveCanvas,
      refetchCanvases,
      setCanvasId,
      isCanvasLocked,
      trackUsage,
    ]
  );

  const deleteCanvasIdsByTypeWrapper = useCallback(
    async ({
      ids,
      canvasExternalId,
    }: {
      ids: IdsByType;
      canvasExternalId: string;
    }) => {
      if (isCanvasLocked) {
        return;
      }

      if (ids.annotationIds.length === 0 && ids.containerIds.length === 0) {
        return;
      }
      return deleteCanvasIdsByType({ ids, canvasExternalId });
    },
    [deleteCanvasIdsByType, isCanvasLocked]
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
        deleteCanvasIdsByType: deleteCanvasIdsByTypeWrapper,
        isCanvasLocked,
      }}
    >
      {children}
    </IndustryCanvasContext.Provider>
  );
};

export const useIndustryCanvasContext = (): IndustryCanvasContextType =>
  useContext(IndustryCanvasContext);
