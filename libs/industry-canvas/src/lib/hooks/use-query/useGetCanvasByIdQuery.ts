import { useQuery } from '@tanstack/react-query';

import { QueryKeys } from '../../constants';
import type { IndustryCanvasService } from '../../services/IndustryCanvasService';
import { SerializedCanvasDocument } from '../../types';

export const useGetCanvasByIdQuery = (
  service: IndustryCanvasService,
  canvasId: string | undefined
) => {
  return useQuery<SerializedCanvasDocument>(
    [QueryKeys.GET_CANVAS, canvasId],
    () => service.getCanvasById(canvasId ?? ''),
    { enabled: canvasId !== undefined }
  );
};
