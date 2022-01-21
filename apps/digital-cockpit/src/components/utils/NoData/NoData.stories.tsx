import configureStory from 'storybook/configureStory';
import { Meta } from '@storybook/react';
import { ExtendedStory } from 'utils/test/storybook';

import NoData, { NoDataProps } from './NoData';

const meta: Meta<NoDataProps> = {
  title: 'Utils / No Data',
  component: NoData,
  argTypes: {
    type: {
      name: 'Type',
      defaultValue: 'Documents',
    },
  },
};

export default meta;

const Template: ExtendedStory<NoDataProps> = (args) => <NoData {...args} />;

export const Standard = Template.bind({});
Standard.story = configureStory({});
