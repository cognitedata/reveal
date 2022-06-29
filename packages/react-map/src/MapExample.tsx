import * as React from 'react';
import { featureCollection, Feature } from '@turf/helpers';
import { GeoJson } from '@cognite/seismic-sdk-js';

import { Map } from './Map';
import { DrawMode } from './types';

export const MapExample: React.FC = () => {
  const [drawMode, _setDrawMode] = React.useState<DrawMode>('direct_select');
  const [selectedFeature, _setSelectedFeature] = React.useState<GeoJson | null>(
    null
  );
  const [focusedFeature, _setFocusedFeature] = React.useState<Feature | null>(
    null
  );
  const renderNavigationControls = (_mapWidth: number) => {
    return <> </>;
  };

  const features = React.useMemo(() => {
    // remove any null or empty points and convert to an official 'featureCollection'
    return featureCollection([]);
  }, []);

  return (
    <Map
      MAPBOX_TOKEN=""
      MAPBOX_MAP_ID=""
      maxBounds={undefined}
      center={[12, 60]}
      zoom={4}
      sources={[]}
      layers={[]}
      events={[]}
      features={features}
      focusedFeature={focusedFeature}
      selectedFeature={selectedFeature}
      flyTo={null}
      drawMode={drawMode}
      renderNavigationControls={renderNavigationControls}
    />
  );
};
