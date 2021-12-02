import React from 'react';

import type { MapboxOptions } from 'maplibre-gl';

interface MapSettings {
  zoom?: MapboxOptions['zoom'];
  center?: MapboxOptions['center'];
}

const MapContext = React.createContext<
  [
    Partial<MapSettings>,
    React.Dispatch<React.SetStateAction<Partial<MapSettings>>>
  ]
>([{}, () => console.warn('Context not setup')]);

export const useMapContext = () => React.useContext(MapContext);

export const MapCache: React.FC = ({ children }) => {
  const [mapSettings, setMapSettings] = React.useState<Partial<MapSettings>>(
    {}
  );

  // const mapValues = React.useMemo(() => {
  //   return [mapSettings, setMapSettings];
  // }, [mapSettings]);

  return (
    // @TODO(PP-2241)
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <MapContext.Provider value={[mapSettings, setMapSettings]}>
      {children}
    </MapContext.Provider>
  );
};
