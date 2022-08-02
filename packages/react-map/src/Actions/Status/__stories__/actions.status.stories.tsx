import * as React from 'react';
import { getFeature } from '__fixtures/getFeature';
import { Story, Meta } from '@storybook/react';

import { Actions } from '../../Actions';
import { Map } from '../../../Map';
import { drawModes } from '../../../FreeDraw';
import { props } from '../../../__stories__/defaultProps';
import { MapWrapper } from '../../../__stories__/elements';

export default {
  title: 'Map / Buttons / Status',
  component: Actions.Status,
  argTypes: {
    draw: {
      name: 'Draw mode',
      options: [
        drawModes.DRAW_POLYGON,
        drawModes.DIRECT_SELECT,
        drawModes.SIMPLE_SELECT,
      ],
      control: { type: 'radio' },
    },
    polygon: {
      name: 'Polygon?',
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
} as Meta;

const BaseComponent: Story<React.ComponentProps<typeof Actions.Status>> = (
  props: React.ComponentProps<typeof Actions.Status>
) => (
  <Actions.Wrapper>
    <Actions.Status {...props} />
  </Actions.Wrapper>
);

export const Simple = BaseComponent.bind({});

export const WithMap = () => {
  const mapProps = {
    ...props,
    draw: drawModes.DRAW_POLYGON,
    initialPolygon: getFeature(),
  };

  return (
    <MapWrapper>
      <Map {...mapProps}>
        <BaseComponent />
      </Map>
    </MapWrapper>
  );
};
