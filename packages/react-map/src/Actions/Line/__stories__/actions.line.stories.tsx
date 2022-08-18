import * as React from 'react';
import { Story, Meta } from '@storybook/react';

import { Actions } from '../../Actions';
import { LineProps } from '../LineButton';
import { Map } from '../../../Map';
import { drawModes } from '../../../FreeDraw';
import { props } from '../../../__stories__/defaultProps';
import { MapWrapper } from '../../../__stories__/elements';

export default {
  title: 'Map / Action Bar / Line',
  component: Actions.Line,
  argTypes: {},
} as Meta;

const BaseComponent = (props: React.ComponentProps<typeof Actions.Line>) => (
  <Actions.Wrapper>
    <Actions.Line {...props} />
  </Actions.Wrapper>
);

export const Simple: Story<LineProps> = BaseComponent.bind({});

export const WithMap = () => {
  const mapProps = {
    ...props,
    draw: drawModes.DRAW_POLYGON,
    // initialPolygon: [[1, 1]],
  };

  return (
    <MapWrapper>
      <Map {...mapProps}>
        <BaseComponent />
      </Map>
    </MapWrapper>
  );
};
