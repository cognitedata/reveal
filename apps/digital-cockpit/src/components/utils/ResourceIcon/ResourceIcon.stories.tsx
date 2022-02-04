import configureStory from 'storybook/configureStory';
import { Meta } from '@storybook/react';
import { ExtendedStory } from 'utils/test/storybook';

import ResourceIcon, { ResourceIconProps } from '.';

const meta: Meta<ResourceIconProps> = {
  title: 'Utils / Resource Icon ',
  component: ResourceIcon,
  argTypes: {
    type: {
      name: 'Type',
      defaultValue: 'Timeseries',
      options: ['Timeseries', 'Events', 'Document'],
      control: {
        type: 'select',
      },
    },
  },
};

export default meta;

const Template: ExtendedStory<ResourceIconProps> = ({ type }) => (
  <>
    <ResourceIcon type={type} />
    <span>{type}</span>
  </>
);

export const Standard = Template.bind({});
Standard.story = configureStory({});
