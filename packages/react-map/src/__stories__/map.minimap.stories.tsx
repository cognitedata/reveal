import * as React from 'react';
import { Story, ComponentMeta } from '@storybook/react';

import { Map } from '../Map';

import { props as defaultProps } from './defaultProps';
import { MapWrapper } from './elements';

export default {
  title: 'Map / Map',
  component: Map,
} as ComponentMeta<typeof Map>;

const BaseComponent: Story<React.ComponentProps<typeof Map>> = (props) => {
  return (
    <MapWrapper>
      <Map {...defaultProps} {...props} />
    </MapWrapper>
  );
};

// NOTE: the way the minimap is setup causes it NOT to be dynamic.
// eg: if you change the prod, it will NOT toggle state

export const MinimapOff = BaseComponent.bind({});
MinimapOff.args = {
  disableMinimap: true,
};
export const MinimapOn = BaseComponent.bind({});
MinimapOn.args = {
  disableMinimap: false,
};
