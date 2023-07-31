import * as React from 'react';
import { Story, Meta } from '@storybook/react';

import { Map } from '../../../Map';
import { MapWrapper } from '../../../__stories__/elements';
import { props as defaultProps } from '../../../__stories__/defaultProps';

export default {
  title: 'Map / Action Bar / Wrapper',
  component: Map,
} as Meta;

const Child = () => <div>Testing simple children</div>;
const BaseComponent: Story<React.ComponentProps<typeof Map>> = (props) => {
  return (
    <MapWrapper>
      <Map {...defaultProps} {...props} renderChildren={() => <Child />} />
    </MapWrapper>
  );
};

export const WithChildren = BaseComponent.bind({});
WithChildren.args = {};
