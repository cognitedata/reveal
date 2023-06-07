import { captureException } from '@sentry/react';
import { useQuery } from '@tanstack/react-query';

import { toast } from '@cognite/cogs.js';

import { QueryKeys, TOAST_POSITION } from '../../constants';
import type { IndustryCanvasService } from '../../services/IndustryCanvasService';
import { SerializedCanvasDocument } from '../../types';

export const useGetCanvasByIdQuery = (
  service: IndustryCanvasService,
  canvasId: string | undefined
) => {
  return useQuery<SerializedCanvasDocument>(
    [QueryKeys.GET_CANVAS, canvasId],
    () => service.getCanvasById(canvasId ?? ''),
    {
      enabled: canvasId !== undefined,
      onError: (error) => {
        captureException(error);
        toast.error(`Failed to retrieve canvas with id ${canvasId}`, {
          toastId: 'industry-canvas-getCanvasById-error',
          position: TOAST_POSITION,
        });
      },
    }
  );
};
