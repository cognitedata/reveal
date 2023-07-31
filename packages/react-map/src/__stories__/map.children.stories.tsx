import * as React from 'react';
import { Story, Meta } from '@storybook/react';

import { Map } from '../Map';

import { props as defaultProps } from './defaultProps';
import { MapWrapper } from './elements';

export default {
  title: 'Map / Map',
  component: Map,
} as Meta;

const Child = () => (
  <div>
    <div>These children will be hidden behind the map.</div>
    <div>
      To display things on top of the map, use the Actions.Wrapper helpers.
    </div>
    <div>
      To display things in another place with Map state, use ExtraContent.
    </div>
  </div>
);
const BaseComponent: Story<React.ComponentProps<typeof Map>> = (props) => {
  return (
    <MapWrapper>
      <Map {...defaultProps} {...props} renderChildren={Child} />
    </MapWrapper>
  );
};

export const WithChildren = BaseComponent.bind({});
WithChildren.args = {};
