import { useQuery } from 'react-query';
import type { IndustryCanvasService } from '../../services/IndustryCanvasService';
import { PersistedCanvasState } from '../../types';
import { QueryKeys } from '../../constants';

export const useGetCanvasByIdQuery = (
  service: IndustryCanvasService,
  canvasId: string | null
) => {
  return useQuery<PersistedCanvasState>(
    [QueryKeys.GET_CANVAS, canvasId],
    () => service.getCanvasById(canvasId ?? ''),
    { enabled: canvasId !== null }
  );
};
