import { useProjectConfig } from 'hooks/useProjectConfig';
import { SelectableLayer } from 'modules/map/types';
import {
  DOCUMENT_LAYER_ID,
  WELL_HEADS_LAYER_ID,
} from 'pages/authorized/search/map/constants';

export function useStaticSelectableLayers(): SelectableLayer[] {
  const { data: projectConfig } = useProjectConfig();
  const layers = [];

  if (!projectConfig?.documents?.disabled) {
    layers.push({
      id: DOCUMENT_LAYER_ID,
      name: 'Documents',
      selected: true,
      layers: [],
    });
  }

  if (!projectConfig?.wells?.disabled) {
    layers.push({
      id: WELL_HEADS_LAYER_ID,
      name: 'Well heads',
      selected: true,
      layers: [],
    });
  }

  return layers;
}
