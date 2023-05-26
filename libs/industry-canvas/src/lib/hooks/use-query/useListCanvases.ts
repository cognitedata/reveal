import { useQuery } from '@tanstack/react-query';

import { QueryKeys } from '../../constants';
import type { IndustryCanvasService } from '../../services/IndustryCanvasService';
import { SerializedCanvasDocument } from '../../types';

export const useListCanvases = (service: IndustryCanvasService) => {
  return useQuery<SerializedCanvasDocument[]>(
    [QueryKeys.LIST_CANVASES],
    async () => service.listCanvases()
  );
};
