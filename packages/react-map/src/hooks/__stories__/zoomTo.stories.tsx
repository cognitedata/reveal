import { useState } from 'react';
import { Button } from '@cognite/cogs.js';
import { Meta } from '@storybook/react';
import { feature } from '@turf/helpers';

import { Map } from '../../Map';
import { MapProps } from '../../types';
import { MapWrapper } from '../../__stories__/elements';
import { props } from '../../__stories__/defaultProps';

export default {
  title: 'Map / Focus',
  component: Map,
} as Meta;

export const WithFocus = () => {
  const [zoom, setZoom] = useState<MapProps['focusedFeature']>();

  const handleFocusOnSouth = () => {
    setZoom(
      feature({
        type: 'Polygon',
        coordinates: [
          [
            [2.959506328790212, 53.087264358871465],
            [4.402492169401654, 53.06710488689666],
            [4.212331244670338, 52.348730083993644],
            [3.0378078860330504, 52.348730083993644],
            [2.959506328790212, 53.087264358871465],
          ],
        ],
      })
    );
  };

  const handleFocusOnNCS = () => {
    setZoom(
      feature({
        type: 'Polygon',
        coordinates: [
          [
            [5.38623046875, 63.39242993143364],
            [0.15673828125028422, 63.29385054906203],
            [0.11279296874994316, 60.37143149033014],
            [3.1889648437498863, 61.22893315966601],
            [5.298339843749517, 62.67507416153296],
            [5.38623046875, 63.39242993143364],
          ],
        ],
      })
    );
  };

  return (
    <>
      <Button type="ghost" onClick={handleFocusOnNCS} aria-label="Fly to KTM">
        Focus on NCS
      </Button>
      <Button type="ghost" onClick={handleFocusOnSouth} aria-label="Fly to NY">
        Focus on South NCS
      </Button>
      <MapWrapper>
        <Map {...props} focusedFeature={zoom} />
      </MapWrapper>
    </>
  );
};
