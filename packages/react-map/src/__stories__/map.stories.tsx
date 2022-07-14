import { useState } from 'react';
import { featureCollection, feature } from '@turf/helpers';
import { Button } from '@cognite/cogs.js';

import { DrawMode } from '../types';
import { Map } from '../Map';

export default {
  title: 'Components / Map',
  component: Map,
};

const props = {
  drawMode: 'direct_select' as DrawMode,
  events: [],
  features: featureCollection([], {}),
  flyTo: null,
  focusedFeature: feature({
    type: 'Point',
    coordinates: [110, 50],
  }),
  layers: [],
  selectedFeature: null,
  // selectedFeature: feature({
  //   type: 'Point',
  //   coordinates: [110, 50],
  // }),
  sources: [],

  MAPBOX_TOKEN: '',
  MAPBOX_MAP_ID: '',
  // maxBounds:{undefined},
  center: [12, 60] as [number, number],
  zoom: 4,
  // renderNavigationControls:{renderNavigationControls}  ,
};

export const basic = () => {
  return (
    <div style={{ display: 'flex' }}>
      <Map {...props} />
    </div>
  );
};

export const verticalDocked = () => {
  return (
    <div style={{ display: 'flex' }}>
      <Map {...props} />
    </div>
  );
};

export const WithFlyTo = () => {
  const [position, setPosition] = useState({ zoom: 1, center: [0, 0] });

  const handleFlyTo = () => {
    setPosition({ zoom: 6, center: [-74.1, 40.7] });
  };

  return (
    <div style={{ display: 'flex' }}>
      <Map {...props} flyTo={position} />

      <Button onClick={handleFlyTo} aria-label="Fly to NY">
        Fly to NY
      </Button>
    </div>
  );
};
