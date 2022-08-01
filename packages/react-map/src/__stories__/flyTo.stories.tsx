import { useState } from 'react';
import { Button } from '@cognite/cogs.js';

import { Map, Props } from '../Map';

import { MapWrapper } from './elements';
import { props } from './defaultProps';

export default {
  title: 'Map / Map',
  component: Map,
};

export const WithFlyTo = () => {
  const [position, setPosition] = useState<Props['flyTo']>({
    zoom: 1,
    center: [0, 0],
  });

  const handleFlyTo = () => {
    setPosition({ zoom: 6, center: [-74.1, 40.7] });
  };

  const handleFlyToKtm = () => {
    setPosition({ zoom: 6, center: { lat: 27.7172, lng: 85.324 } });
  };

  return (
    <>
      <Button onClick={handleFlyTo} aria-label="Fly to NY">
        Fly to NY
      </Button>
      -
      <Button onClick={handleFlyToKtm} aria-label="Fly to KTM">
        Fly to KTM
      </Button>
      <MapWrapper>
        <Map {...props} flyTo={position} />
      </MapWrapper>
    </>
  );
};
