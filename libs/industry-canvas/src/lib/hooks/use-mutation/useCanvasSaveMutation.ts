import { captureException } from '@sentry/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCdfUserHistoryService } from '@user-history';

import { toast } from '@cognite/cogs.js';

import { QueryKeys, TOAST_POSITION } from '../../constants';
import type { IndustryCanvasService } from '../../services/IndustryCanvasService';
import { SerializedCanvasDocument } from '../../types';
import { getCanvasLink } from '../../utils/getCanvasLink';

export const useCanvasSaveMutation = (service: IndustryCanvasService) => {
  const queryClient = useQueryClient();
  const userHistoryService = useCdfUserHistoryService();

  return useMutation(
    [QueryKeys.SAVE_CANVAS],
    (canvas: SerializedCanvasDocument) => {
      return service.saveCanvas(canvas);
    },
    {
      onMutate: async (updatedCanvas) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries([
          QueryKeys.GET_CANVAS,
          updatedCanvas.externalId,
        ]);
        await queryClient.cancelQueries([QueryKeys.LIST_CANVASES]);

        // Snapshot the previous values
        const previousCanvas =
          queryClient.getQueryData<SerializedCanvasDocument>([
            QueryKeys.GET_CANVAS,
            updatedCanvas.externalId,
          ]);

        // Optimistically update to the new values
        queryClient.setQueryData<SerializedCanvasDocument>(
          [QueryKeys.GET_CANVAS, updatedCanvas.externalId],
          { ...updatedCanvas, updatedAt: new Date().toISOString() }
        );
        queryClient.setQueriesData<SerializedCanvasDocument[]>(
          [QueryKeys.LIST_CANVASES],
          (prevCanvases: SerializedCanvasDocument[] = []) => {
            return prevCanvases.map((canvas) =>
              canvas.externalId === updatedCanvas.externalId
                ? {
                    ...updatedCanvas,
                    externalId: updatedCanvas.externalId,
                    name: updatedCanvas.name,
                    updatedAt: new Date().toISOString(),
                  }
                : canvas
            );
          }
        );

        // Return a context with the previous and updated canvases
        return { previousCanvas, updatedCanvas };
      },
      onError: (
        err,
        canvas,
        context?: {
          previousCanvas: SerializedCanvasDocument | undefined;
          updatedCanvas: SerializedCanvasDocument;
        }
      ) => {
        if (context) {
          queryClient.setQueryData(
            [QueryKeys.GET_CANVAS, context.updatedCanvas.externalId],
            context?.previousCanvas
          );
          // Refetch since we don't know which queries have been updated
          queryClient.refetchQueries([QueryKeys.LIST_CANVASES]);
        }
        captureException(err);
        toast.error('Failed to update canvas', {
          toastId: 'industry-canvas-update-error',
          position: TOAST_POSITION,
        });
      },
      onSuccess: (updatedCanvas) => {
        if (!updatedCanvas) {
          return;
        }

        userHistoryService.logNewResourceEdit({
          application: 'industry-canvas',
          name: updatedCanvas.name,
          path: getCanvasLink(updatedCanvas.externalId),
        });
      },
      onSettled: (updatedCanvas) => {
        if (!updatedCanvas) {
          return;
        }

        queryClient.invalidateQueries({
          queryKey: [QueryKeys.GET_CANVAS, updatedCanvas.externalId],
        });
        queryClient.invalidateQueries({ queryKey: [QueryKeys.LIST_CANVASES] });
      },
    }
  );
};
