import { toast } from '@cognite/cogs.js';
import { captureException } from '@sentry/react';
import { useMutation, useQueryClient } from 'react-query';
import type { IndustryCanvasService } from '../../services/IndustryCanvasService';

import { QueryKeys, TOAST_POSITION } from '../../constants';
import { PersistedCanvasState } from '../../types';

export const useCanvasSaveMutation = (service: IndustryCanvasService) => {
  const queryClient = useQueryClient();

  return useMutation(
    [QueryKeys.SAVE_CANVAS],
    (canvas: PersistedCanvasState) => {
      return service.saveCanvas(canvas);
    },
    {
      onMutate: async (updatedCanvas) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries([
          QueryKeys.GET_CANVAS,
          updatedCanvas.externalId,
        ]);

        // Snapshot the previous values
        const previousCanvas = queryClient.getQueryData<PersistedCanvasState>([
          QueryKeys.GET_CANVAS,
          updatedCanvas.externalId,
        ]);

        // Optimistically update to the new values
        queryClient.setQueryData<PersistedCanvasState>(
          [QueryKeys.GET_CANVAS, updatedCanvas.externalId],
          { ...updatedCanvas, updatedAt: new Date().toISOString() }
        );

        // Return a context with the previous and updated canvases
        return { previousCanvas, updatedCanvas };
      },
      onError: (
        err,
        canvas,
        context?: {
          previousCanvas: PersistedCanvasState | undefined;
          updatedCanvas: PersistedCanvasState;
        }
      ) => {
        if (context) {
          queryClient.setQueryData(
            [QueryKeys.GET_CANVAS, context.updatedCanvas.externalId],
            context?.previousCanvas
          );
        }
        captureException(err);
        toast.error('Failed to update canvas', {
          toastId: 'industry-canvas-update-error',
          position: TOAST_POSITION,
        });
      },
    }
  );
};
