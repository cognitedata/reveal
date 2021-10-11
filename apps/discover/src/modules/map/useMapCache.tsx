import React from 'react';

import type { MapboxOptions } from 'maplibre-gl';

interface MapSettings {
  zoom?: MapboxOptions['zoom'];
  center?: MapboxOptions['center'];
}

const MapContext = React.createContext<[Partial<MapSettings>, any]>([
  {},
  () => console.warn('Context not setup'),
]);

export const useMapContext = () => React.useContext(MapContext);

export const MapCache: React.FC = ({ children }) => {
  const [mapSettings, setMapSettings] = React.useState({});

  return (
    <MapContext.Provider value={[mapSettings, setMapSettings]}>
      {children}
    </MapContext.Provider>
  );
};
