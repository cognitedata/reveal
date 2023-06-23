import { captureException } from '@sentry/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from '@cognite/cogs.js';

import { QueryKeys, TOAST_POSITION } from '../../constants';
import type { IndustryCanvasService } from '../../services/IndustryCanvasService';

export const useCanvasArchiveMutation = (service: IndustryCanvasService) => {
  const queryClient = useQueryClient();

  return useMutation(
    [QueryKeys.ARCHIVE_CANVAS],
    (externalId: string) => {
      return service.archiveCanvas(externalId);
    },
    {
      onMutate: async (externalId) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries([QueryKeys.GET_CANVAS, externalId]);

        // Snapshot the previous values
        const previousExternalId = queryClient.getQueryData([
          QueryKeys.GET_CANVAS,
          externalId,
        ]);

        // Optimistically update to the new values
        queryClient.removeQueries([QueryKeys.GET_CANVAS, externalId]);

        // Return a context with the previous and new canvases
        return { previousExternalId, externalId };
      },
      onError: (err, externalId, context) => {
        if (context) {
          queryClient.setQueryData(
            [QueryKeys.GET_CANVAS, externalId],
            context.previousExternalId
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
