import { Story, Meta } from '@storybook/react';

import {
  getMapLayerConfig,
  getMapLayerConfigBlocks,
} from '../__fixtures/getMapLayerConfig';
import { getMapLayerData } from '../__fixtures/getMapLayerData';
import { Map } from '../Map';
import { getSortedFlatLayers } from '../layers';
import { getMapLayerDataBlocks } from '../__fixtures/getMapLayerDataBlocks';

import { props as defaultProps } from './defaultProps';
import { MapWrapper } from './elements';

const getConfigs = (selected = true) => getMapLayerConfig({ selected });
const getConfigsTwo = (selected = true) =>
  getMapLayerConfigBlocks({ selected });

const getConfigsOff = () => {
  return getSortedFlatLayers([getConfigs(false), getConfigsTwo(false)]);
};

export default {
  title: 'Map / Sources',
  component: Map,
  argTypes: {
    layerConfigs: {
      name: 'Layer Configs',
      options: ['None', 'SetOne', 'SetTwo'],
      mapping: {
        SetOne: getConfigs(),
        SetTwo: getConfigsTwo(),
        None: getConfigsOff(),
      },
      control: { type: 'radio' },
    },
    layerData: {
      name: 'Layer Data',
      options: ['None', 'One', 'SetTwo'],
      mapping: {
        SetOne: [getMapLayerData()],
        SetTwo: [getMapLayerDataBlocks()],
        None: [],
      },
      control: { type: 'radio' },
    },
  },
} as Meta;

const BaseComponent: Story<React.ComponentProps<typeof Map>> = (props) => {
  return (
    <MapWrapper>
      <Map {...defaultProps} {...props} />
    </MapWrapper>
  );
};

export const Simple = BaseComponent.bind({});
Simple.args = {};
