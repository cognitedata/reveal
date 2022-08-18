import * as React from 'react';
import { Story, ComponentMeta } from '@storybook/react';

import { Actions } from '../../Actions';
import { Map } from '../../../Map';
import { drawModes } from '../../../FreeDraw';
import { props as defaultProps } from '../../../__stories__/defaultProps';
import { MapWrapper } from '../../../__stories__/elements';

export default {
  title: 'Map / Action Bar / Status',
  component: Actions.Status,
  argTypes: {
    drawMode: {
      name: 'Draw mode',
      options: ['Polygon', 'Click', 'Select'],
      mapping: {
        Polygon: drawModes.DRAW_POLYGON,
        DIRECT_SELECT: drawModes.DIRECT_SELECT,
        SIMPLE_SELECT: drawModes.SIMPLE_SELECT,
      },
      control: { type: 'radio' },
    },
    drawnFeatures: {
      name: 'User created polygon?',
      options: ['Yes', 'No'],
      mapping: { Yes: [1, 2], No: [] },
      control: { type: 'radio' },
    },
    selectedFeatures: {
      name: 'Selected Features?',
      options: ['Yes', 'No'],
      mapping: { Yes: [1, 2], No: [] },
      control: { type: 'radio' },
    },
  },
} as ComponentMeta<typeof Actions.Status>;

type StatusProps = React.ComponentProps<typeof Actions.Status>;

const BaseComponent: Story<StatusProps> = (props) => (
  <Actions.Status {...props} />
);

export const Editing = {
  render: BaseComponent,
  args: {
    drawMode: drawModes.DRAW_POLYGON,
    selectedFeatures: 'No',
    drawnFeatures: [],
  },
};

export const Exists = {
  render: BaseComponent,
  args: {
    drawMode: drawModes.DRAW_POLYGON,
    selectedFeatures: 'No',
    drawnFeatures: [1],
  },
};

export const Nothing = {
  render: BaseComponent,
  args: {
    drawMode: drawModes.SIMPLE_SELECT,
    selectedFeatures: 'No',
    drawnFeatures: [],
  },
};

const WithMapWrapper = (props: StatusProps) => {
  return (
    <MapWrapper>
      <Map
        {...defaultProps}
        {...props}
        renderChildren={(props) => (
          <Actions.Wrapper {...props} renderChildren={Actions.Status} />
        )}
      />
    </MapWrapper>
  );
};

export const WithMap = {
  render: WithMapWrapper,
  args: {
    drawMode: drawModes.SIMPLE_SELECT,
    selectedFeatures: 'No',
    drawnFeatures: [],
  },
};
