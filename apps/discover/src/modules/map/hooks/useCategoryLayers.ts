import { useMemo } from 'react';

import { SelectableLayer } from '@cognite/react-map';

import { useProjectConfig } from 'hooks/useProjectConfig';
import {
  DOCUMENT_LAYER_ID,
  WELL_HEADS_LAYER_ID,
} from 'pages/authorized/search/map/constants';

const documentLayer = Object.freeze({
  id: DOCUMENT_LAYER_ID,
  name: 'Documents',
  selected: true,
  layers: [],
});

const wellLayer = Object.freeze({
  id: WELL_HEADS_LAYER_ID,
  name: 'Well heads',
  selected: true,
  layers: [],
});

export function useCategoryLayers(): SelectableLayer[] {
  const { data: projectConfig } = useProjectConfig();

  return useMemo(() => {
    const layers = [];
    if (!projectConfig?.documents?.disabled) {
      layers.push(documentLayer);
    }

    if (!projectConfig?.wells?.disabled) {
      layers.push(wellLayer);
    }

    return layers;
  }, [projectConfig]);
}
