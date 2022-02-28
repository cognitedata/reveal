import configureStory from 'storybook/configureStory';
import { Meta } from '@storybook/react';
import { ExtendedStory } from 'utils/test/storybook';

import SearchResult, { SearchResultProps } from '.';

const meta: Meta<SearchResultProps> = {
  title: 'Search / Search Result',
  component: SearchResult,
  argTypes: {
    type: {
      name: 'Type',
      defaultValue: 'assets',
      options: ['assets', 'timeseries', 'files'],
      control: {
        type: 'select',
      },
    },
    name: {
      name: 'Name',
      defaultValue: '02-V-2415',
      control: {
        type: 'text',
      },
    },
    description: {
      name: 'Description',
      defaultValue: 'This is a description',
      control: {
        type: 'text',
      },
    },
  },
};

export default meta;

const Template: ExtendedStory<SearchResultProps> = (args) => (
  <SearchResult {...args} />
);

export const Standard = Template.bind({});
Standard.story = configureStory({});
