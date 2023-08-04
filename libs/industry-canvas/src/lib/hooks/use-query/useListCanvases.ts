import { useQuery } from '@tanstack/react-query';

import { QueryKeys } from '../../constants';
import type {
  IndustryCanvasService,
  CanvasVisibility,
} from '../../services/IndustryCanvasService';
import { SerializedCanvasDocument } from '../../types';

export const useListCanvases = (
  service: IndustryCanvasService,
  filter: { visibility: CanvasVisibility }
) => {
  return useQuery<SerializedCanvasDocument[]>(
    [QueryKeys.LIST_CANVASES, filter],
    async () => service.listCanvases({ visibility: filter.visibility })
  );
};
