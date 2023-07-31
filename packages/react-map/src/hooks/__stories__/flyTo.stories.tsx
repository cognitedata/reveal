import { useState } from 'react';
import { Button } from '@cognite/cogs.js';
import { Meta } from '@storybook/react';

import { Map } from '../../Map';
import { MapProps } from '../../types';
import { MapWrapper } from '../../__stories__/elements';
import { props } from '../../__stories__/defaultProps';

export default {
  title: 'Map / Focus',
  component: Map,
} as Meta;

export const WithFlyTo = () => {
  const [position, setPosition] = useState<MapProps['flyTo']>({
    zoom: 1,
    center: [12, 58],
  });

  const handleFlyTo = () => {
    setPosition({ zoom: 6, center: [-74.1, 40.7] });
  };

  const handleFlyToKtm = () => {
    setPosition({ zoom: 6, center: { lat: 27.7172, lng: 85.324 } });
  };

  return (
    <>
      <Button type="ghost" onClick={handleFlyTo} aria-label="Fly to NY">
        Fly to NY
      </Button>
      <Button type="ghost" onClick={handleFlyToKtm} aria-label="Fly to KTM">
        Fly to KTM
      </Button>
      <MapWrapper>
        <Map {...props} flyTo={position} />
      </MapWrapper>
    </>
  );
};
