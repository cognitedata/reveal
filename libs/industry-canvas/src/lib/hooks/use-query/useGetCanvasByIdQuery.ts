import { useQuery } from 'react-query';
import type { IndustryCanvasService } from '../../services/IndustryCanvasService';
import { SerializedCanvasDocument } from '../../types';
import { QueryKeys } from '../../constants';

export const useGetCanvasByIdQuery = (
  service: IndustryCanvasService,
  canvasId: string | null
) => {
  return useQuery<SerializedCanvasDocument>(
    [QueryKeys.GET_CANVAS, canvasId],
    () => service.getCanvasById(canvasId ?? ''),
    { enabled: canvasId !== null }
  );
};
