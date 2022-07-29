import * as React from 'react';

import { Actions } from '../Actions';
import { Map } from '../Map';
import { drawModes } from '../FreeDraw';

import { props } from './defaultProps';
import { MapWrapper } from './elements';

export default {
  title: 'Map / Buttons / Status',
  component: Actions.Status,
  argTypes: {
    draw: {
      options: [
        drawModes.DRAW_POLYGON,
        drawModes.DIRECT_SELECT,
        drawModes.SIMPLE_SELECT,
      ],
      control: { type: 'radio' },
    },
    polygon: {
      options: ['Yes', 'No'],
      mapping: { Yes: [1, 2], No: [] },
      control: { type: 'radio' },
    },
    selectedFeatures: {
      options: ['Yes', 'No'],
      mapping: { Yes: [1, 2], No: [] },
      control: { type: 'radio' },
    },
  },
};

const BaseComponent = (props: React.ComponentProps<typeof Actions.Status>) => (
  <Actions.Wrapper>
    <Actions.Status {...props} />
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
