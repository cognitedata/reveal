import { useQuery } from 'react-query';
import type { IndustryCanvasService } from '../../services/IndustryCanvasService';
import { PersistedCanvasState } from '../../types';
import { QueryKeys } from '../../constants';

export const useListCanvases = (service: IndustryCanvasService) => {
  return useQuery<PersistedCanvasState[]>([QueryKeys.LIST_CANVASES], async () =>
    service.listCanvases()
  );
};
