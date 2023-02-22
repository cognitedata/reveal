import React from 'react';
import { action } from '@storybook/addon-actions';
import { ComponentStory } from '@storybook/react';
import { MultiSelect } from '../MultiSelect';

export default {
  title: 'Component/MultiSelect',
  component: MultiSelect,
  argTypes: {
    isClearable: {
      type: 'boolean',
    },
    isSearchable: {
      type: 'boolean',
    },
  },
};
export const Example: ComponentStory<typeof MultiSelect> = (args) => (
  <MultiSelect {...args} />
);
Example.args = {
  creatable: false,
  isClearable: true,
  isSearchable: false,
  options: [
    {
      label: 'hello',
      value: 'hello',
    },
    {
      label: 'hello 2',
      value: 'hello 2',
    },
  ],
  onChange: action('onChange'),
};
