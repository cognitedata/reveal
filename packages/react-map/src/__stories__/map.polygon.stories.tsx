import { Map } from '../Map';
import { drawModes } from '../FreeDraw';

import { props as defaultProps } from './defaultProps';
import { MapWrapper } from './elements';

export default {
  title: 'Map / Polygon',
  component: Map,
  argTypes: {
    drawMode: {
      options: ['Normal', 'Polygon'],
      mapping: {
        Polygon: drawModes.DRAW_POLYGON,
        Normal: drawModes.SIMPLE_SELECT,
      },
      control: { type: 'radio' },
    },
  },
};

const BaseComponent = (props: React.ComponentProps<typeof Map>) => (
  <MapWrapper>
    <Map {...defaultProps} {...props} />
  </MapWrapper>
);

export const Simple = BaseComponent.bind({});
