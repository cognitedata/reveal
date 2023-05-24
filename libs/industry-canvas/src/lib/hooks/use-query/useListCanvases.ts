import { useQuery } from '@tanstack/react-query';
import type { IndustryCanvasService } from '../../services/IndustryCanvasService';
import { SerializedCanvasDocument } from '../../types';
import { QueryKeys } from '../../constants';

export const useListCanvases = (service: IndustryCanvasService) => {
  return useQuery<SerializedCanvasDocument[]>(
    [QueryKeys.LIST_CANVASES],
    async () => service.listCanvases()
  );
};
