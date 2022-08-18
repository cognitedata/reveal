import * as React from 'react';
import { Story, Meta } from '@storybook/react';
import { getFeatureCollection } from '__fixtures/getFeatureCollection';

import { Map } from '../Map';

import { props as defaultProps } from './defaultProps';
import { MapWrapper } from './elements';

export default {
  title: 'Map / Map',
  component: Map,
  // argTypes: {initialDrawnFeatures,features},
} as Meta;

const BaseComponent: Story<React.ComponentProps<typeof Map>> = (props) => {
  return (
    <MapWrapper>
      <Map {...defaultProps} {...props} />
    </MapWrapper>
  );
};

export const InitialPolygon = BaseComponent.bind({});
InitialPolygon.args = {
  initialDrawnFeatures: getFeatureCollection(),
};
