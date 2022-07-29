import * as React from 'react';

import { Actions } from '../Actions';
import { Map } from '../Map';
import { drawModes } from '../FreeDraw';

import { props } from './defaultProps';
import { MapWrapper } from './elements';

export default {
  title: 'Map / Buttons / Line',
  component: Actions.Line,
  argTypes: {},
};

const BaseComponent = (props: React.ComponentProps<typeof Actions.Line>) => (
  <Actions.Wrapper>
    <Actions.Line {...props} />
  </Actions.Wrapper>
);

export const Simple = BaseComponent.bind({});

export const WithMap = () => {
  const mapProps = {
    ...props,
    draw: drawModes.DRAW_POLYGON,
    initialPolygon: [[1, 1]],
  };

  return (
    <MapWrapper>
      <Map {...mapProps}>
        <BaseComponent />
      </Map>
    </MapWrapper>
  );
};
