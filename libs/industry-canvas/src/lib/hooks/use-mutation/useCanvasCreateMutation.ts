import { captureException } from '@sentry/react';
import { useMutation } from '@tanstack/react-query';

import { toast } from '@cognite/cogs.js';

import { QueryKeys, TOAST_POSITION } from '../../constants';
import type { IndustryCanvasService } from '../../services/IndustryCanvasService';
import { SerializedCanvasDocument } from '../../types';

export const useCanvasCreateMutation = (service: IndustryCanvasService) => {
  return useMutation(
    [QueryKeys.CREATE_CANVAS],
    (canvas: SerializedCanvasDocument) => {
      return service.createCanvas({ ...canvas });
    },
    {
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
