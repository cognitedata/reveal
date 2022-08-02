import { Story, Meta } from '@storybook/react';

import { Map } from '../Map';
import { drawModes } from '../FreeDraw';

import { props as defaultProps } from './defaultProps';
import { MapWrapper } from './elements';

export default {
  title: 'Map / Polygon',
  component: Map,
  argTypes: {
    drawMode: {
      name: 'Draw mode',
      options: ['Normal', 'Polygon'],
      mapping: {
        Polygon: drawModes.DRAW_POLYGON,
        Normal: drawModes.SIMPLE_SELECT,
      },
      control: { type: 'radio' },
    },
  },
} as Meta;

const BaseComponent: Story<React.ComponentProps<typeof Map>> = (props) => (
  <MapWrapper>
    <Map {...defaultProps} {...props} />
  </MapWrapper>
);

export const Simple = BaseComponent.bind({});
