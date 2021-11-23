import { useState } from 'react';

import { featureCollection, feature } from '@turf/helpers';

import { Button } from '@cognite/cogs.js';

import { DrawMode } from 'modules/map/types';
import { Flex } from 'styles/layout';

import Map from './MapboxMap';

export default {
  title: 'Components / Map',
  component: Map,
};

const props = {
  drawMode: 'draw_line_string' as DrawMode,
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
};

export const basic = () => {
  return (
    <Flex>
      <Map {...props} />
    </Flex>
  );
};

export const verticalDocked = () => {
  return (
    <Flex>
      <Map {...props} />
    </Flex>
  );
};

export const withFlyTo = () => {
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
