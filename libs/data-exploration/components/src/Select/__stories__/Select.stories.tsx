import React from 'react';
import { action } from '@storybook/addon-actions';
import { ComponentStory } from '@storybook/react';
import { Select } from '../Select';

export default {
  title: 'Components/Select',
  component: Select,
  argTypes: {
    creatable: {
      type: 'boolean',
    },
    isClearable: {
      type: 'boolean',
    },
    isSearchable: {
      type: 'boolean',
    },
  },
};
export const Example: ComponentStory<typeof Select> = (args) => (
  <Select {...args} />
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
  ],
  onChange: action('onChange'),
};

export const WithNilOption: ComponentStory<typeof Select> = (args) => (
  <Select {...args} />
);
WithNilOption.args = {
  ...Example.args,
  addNilOption: true,
};
