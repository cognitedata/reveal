import { useState } from 'react';
import { Button } from '@cognite/cogs.js';

import { Map } from '../Map';

import { props } from './defaultProps';

export default {
  title: 'Map / Default',
  component: Map,
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
