import mapboxgl from 'maplibre-gl';

import { useDeepEffect } from '../hooks/useDeep';
import { Props as MapProps } from '../Map';

import { addLayer, removeLayer } from './addRemoveVisibleLayer';
import { choosePreviousSelectedLayer } from './choosePreviousSelectedLayer';

interface Props {
  map: mapboxgl.Map;
  layerData: MapProps['layerData'];
  layerConfigs: MapProps['layerConfigs'];
}
export const useAddLayers = ({ map, layerConfigs, layerData }: Props) => {
  useDeepEffect(() => {
    if (map && layerData.length > 0) {
      layerConfigs.forEach((layer, index) => {
        const addLayerBeforeThisLayer = choosePreviousSelectedLayer(
          layerConfigs,
          index
        );

        layer.layers.forEach((innerLayer) => {
          if (layer.selected) {
            // console.log('Adding layer:', layer);
            addLayer(map, innerLayer, addLayerBeforeThisLayer);
          } else {
            // console.log('Removing layer:', layer);
            removeLayer(map, innerLayer.id);
          }
        });
      });
    }
  }, [!!map, layerConfigs, layerData.length]);
};
