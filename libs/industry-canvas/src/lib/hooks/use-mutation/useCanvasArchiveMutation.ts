import { toast } from '@cognite/cogs.js';
import { captureException } from '@sentry/react';
import { useMutation, useQueryClient } from 'react-query';

import { QueryKeys, TOAST_POSITION } from '../../constants';
import type { IndustryCanvasService } from '../../services/IndustryCanvasService';
import { PersistedCanvasState } from '../../types';

export const useCanvasArchiveMutation = (service: IndustryCanvasService) => {
  const queryClient = useQueryClient();

  return useMutation(
    [QueryKeys.ARCHIVE_CANVAS],
    (canvas: PersistedCanvasState) => {
      return service.archiveCanvas(canvas);
    },
    {
      onMutate: async (canvas) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries([
          QueryKeys.GET_CANVAS,
          canvas.externalId,
        ]);

        // Snapshot the previous values
        const previousCanvas = queryClient.getQueryData([
          QueryKeys.GET_CANVAS,
          canvas.externalId,
        ]);

        // Optimistically update to the new values
        queryClient.removeQueries([QueryKeys.GET_CANVAS, canvas.externalId]);

        // Return a context with the previous and new canvases
        return { previousCanvas, canvas };
      },
      onError: (err, canvas, context) => {
        if (context) {
          queryClient.setQueryData(
            [QueryKeys.GET_CANVAS, canvas.externalId],
            context.previousCanvas
          );
        }
        captureException(err);
        toast.error('Failed to archive canvas', {
          toastId: 'industry-canvas-archive-error',
          position: TOAST_POSITION,
        });
      },
    }
  );
};
