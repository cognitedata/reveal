import { useTenantConfig } from 'hooks/useTenantConfig';
import { SelectableLayer } from 'modules/map/types';
import {
  DOCUMENT_LAYER_ID,
  WELL_HEADS_LAYER_ID,
} from 'pages/authorized/search/map/constants';

export function useStaticSelectableLayers(): SelectableLayer[] {
  const { data: tenantConfig } = useTenantConfig();
  const layers = [];

  if (!tenantConfig?.documents?.disabled) {
    layers.push({
      id: DOCUMENT_LAYER_ID,
      name: 'Documents',
      selected: true,
      layers: [],
    });
  }

  if (!tenantConfig?.wells?.disabled) {
    layers.push({
      id: WELL_HEADS_LAYER_ID,
      name: 'Well heads',
      selected: true,
      layers: [],
    });
  }

  return layers;
}
