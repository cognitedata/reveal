import { captureException } from '@sentry/react';
import { useMutation } from '@tanstack/react-query';
import { useCdfUserHistoryService } from '@user-history';

import { toast } from '@cognite/cogs.js';

import { QueryKeys, TOAST_POSITION } from '../../constants';
import type { IndustryCanvasService } from '../../services/IndustryCanvasService';
import { SerializedCanvasDocument } from '../../types';
import { getCanvasLink } from '../../utils/getCanvasLink';

export const useCanvasCreateMutation = (service: IndustryCanvasService) => {
  const userHistoryService = useCdfUserHistoryService();

  return useMutation(
    [QueryKeys.CREATE_CANVAS],
    (canvas: SerializedCanvasDocument) => {
      return service.createCanvas({ ...canvas });
    },
    {
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
      onError: (err) => {
        captureException(err);
        toast.error('Failed to create canvas', {
          toastId: 'industry-canvas-create-error',
          position: TOAST_POSITION,
        });
      },
    }
  );
};
