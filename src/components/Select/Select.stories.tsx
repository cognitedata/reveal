import React from 'react';
import { action } from '@storybook/addon-actions';
import { Select } from './Select';

export default {
  title: 'Component/Select',
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
export const Example = args => <Select {...args} />;
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
