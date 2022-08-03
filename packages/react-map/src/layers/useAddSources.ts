import mapboxgl from 'maplibre-gl';

import { useDeepEffect } from '../hooks/useDeep';
import { MapProps } from '../types';

interface Props {
  map?: mapboxgl.Map;
  layerData: MapProps['layerData'];
}
export const useAddSources = ({ map, layerData }: Props) => {
  useDeepEffect(() => {
    if (!map) {
      return;
    }

    layerData.forEach((source) => {
      // console.log('Adding source:', source);
      addSource(map, source.id, source.data, source.clusterProps);
    });
  }, [!!map, layerData]);
};

const addSource = (
  mapInstance: mapboxgl.Map,
  id: string,
  data: any,
  clusterProps?: {
    cluster: boolean;
    clusterMaxZoom: number;
    clusterRadius: number;
  }
) => {
  if (mapInstance === null) return;
  if (mapInstance.getSource(id) === undefined) {
    // console.log('Adding source:', id);
    mapInstance.addSource(id, {
      type: 'geojson',
      data,
      ...clusterProps,
    });
  } else {
    // console.log('Setting data on source:', id);
    const source = mapInstance.getSource(id) as mapboxgl.GeoJSONSource;
    // console.log('Source found:', { source, data });
    source.setData(data);
  }
};
