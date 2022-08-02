import { Story, Meta } from '@storybook/react';

import { Map } from '../Map';

import { props } from './defaultProps';
import { MapWrapper } from './elements';

export default {
  title: 'Map / Map',
  component: Map,
} as Meta;

export const basic: Story = () => {
  return (
    <MapWrapper>
      <Map {...props} />
    </MapWrapper>
  );
};
