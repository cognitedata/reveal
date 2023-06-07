import { captureException } from '@sentry/react';
import { useMutation } from '@tanstack/react-query';

import { toast } from '@cognite/cogs.js';
import { IdsByType } from '@cognite/unified-file-viewer';

import { QueryKeys, TOAST_POSITION } from '../../constants';
import type { IndustryCanvasService } from '../../services/IndustryCanvasService';

export const useDeleteCanvasIdsByTypeMutation = (
  service: IndustryCanvasService
) => {
  return useMutation(
    [QueryKeys.DELETE_CANVAS_ITEMS],
    ({
      ids,
      canvasExternalId,
    }: {
      ids: IdsByType;
      canvasExternalId: string;
    }) => {
      return service.deleteCanvasIdsByType(ids, canvasExternalId);
    },
    {
      onError: (err) => {
        captureException(err);
        toast.error('Failed to delete canvas items', {
          toastId: 'industry-canvas-delete-canvas-items-error',
          position: TOAST_POSITION,
        });
      },
    }
  );
};
