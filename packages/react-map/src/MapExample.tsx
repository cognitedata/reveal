import * as React from 'react';
import { featureCollection } from '@turf/helpers';

import { DrawMode } from './FreeDraw';
import { Map } from './Map';
import { MapFeature } from './types';

export const MapExample: React.FC = () => {
  const [drawMode, _setDrawMode] = React.useState<DrawMode>('direct_select');
  const [selectedFeature, _setSelectedFeature] = React.useState<MapFeature>();
  const [focusedFeature, _setFocusedFeature] = React.useState<MapFeature>();
  const renderNavigationControls = (_mapWidth: number) => {
    return <> </>;
  };

  const features = React.useMemo(() => {
    // remove any null or empty points and convert to an official 'featureCollection'
    return featureCollection([]);
  }, []);

  return (
    <Map
      MAPBOX_TOKEN={String(process.env.STORYBOOK_MAPBOX_TOKEN)}
      MAPBOX_MAP_ID={String(process.env.STORYBOOK_MAPBOX_MAP_ID)}
      maxBounds={undefined}
      center={[12, 60]}
      zoom={4}
      layerData={[]}
      layerConfigs={[]}
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
