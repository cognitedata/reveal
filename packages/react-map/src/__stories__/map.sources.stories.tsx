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

const getConfigsOne = (selected = true) => getMapLayerConfig({ selected });
const getConfigsTwo = (selected = true) =>
  getMapLayerConfigBlocks({ selected });

const getConfigsOff = () => {
  return getSortedFlatLayers([getConfigsOne(false), getConfigsTwo(false)]);
};

export default {
  title: 'Map / Map',
  component: Map,
  argTypes: {
    layerConfigs: {
      name: 'Layer Configs',
      options: ['None', 'SetOne', 'SetTwo'],
      mapping: {
        SetOne: getSortedFlatLayers([getConfigsOne()]),
        SetTwo: getSortedFlatLayers([getConfigsTwo()]),
        None: getConfigsOff(),
      },
      control: { type: 'radio' },
    },
    layerData: {
      name: 'Layer Data',
      options: ['None', 'SetOne', 'SetTwo'],
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

export const WithSources = BaseComponent.bind({});
WithSources.args = {};
