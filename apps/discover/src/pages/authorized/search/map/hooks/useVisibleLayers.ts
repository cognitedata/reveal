import React, { useMemo } from 'react';

import { useMap } from 'modules/map/selectors';
import { SelectableLayer } from 'modules/map/types';

import { useLayers } from '../hooks/useLayers';
import { getBaseLayers, getStaticLayers } from '../utils';

/*
 * i think there is some work we can do to optimize this
 * seems like we are double processing layers a bit
 * eg: why make 'showingLayers'? can't selectableLayers already have that selection?
 */
export const useVisibleLayers = (selectableLayers: SelectableLayer[]) => {
  const { layers: allLayers } = useLayers();
  const { selectedLayers } = useMap();
  const staticLayers = React.useMemo(() => getStaticLayers(), []);

  return useMemo(() => {
    const showingLayers = selectableLayers.map((layer) => {
      return {
        ...layer,
        selected: selectedLayers.includes(layer.id),
      };
    });

    const baseLayers = getBaseLayers(allLayers);
    const layers = [...baseLayers, ...showingLayers, staticLayers];

    // This extracts all the layers including child layers in to one array
    // so that we can then sort these child layers
    const flattenLayers = layers.reduce(
      (result, layer) => [
        ...result,
        ...layer.layers.map((childLayer) => ({
          ...layer,
          layers: [childLayer],
          id: childLayer.id,
          weight: childLayer.weight || layer.weight,
        })),
      ],
      [] as SelectableLayer[]
    );

    // sort the layers into the right order,
    // so then when adding to the map we only have to maintain this order
    // because mapbox only let's us set the 'before' layer
    // we have no other way to add a layer at a certian 'level'
    flattenLayers.sort((a, b) => {
      return (b.weight || 0) - (a.weight || 0);
    });

    return flattenLayers;
  }, [selectedLayers, allLayers, staticLayers]);
};
