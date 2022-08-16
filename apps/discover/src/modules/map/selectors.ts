import { GeoJson, Geometry } from '@cognite/seismic-sdk-js';

import useSelector from 'hooks/useSelector';

export const useMap = () => {
  return useSelector((state) => state.map);
};

export const useMapDrawMode = () => {
  return useSelector((state) => state.map.drawMode);
};

export const useGeoFilter = () => {
  const { geoFilter } = useMap();
  return geoFilter as GeoJson[];
};

export const useCurrentPolygon = () => {
  const geoFilter = useGeoFilter();
  if (!geoFilter) {
    return null;
  }
  return geoFilter[0]?.geometry as Geometry;
};

export const useGetTypeFromGeometry = () => {
  const geometry = useCurrentPolygon();
  return geometry?.type || null;
};
