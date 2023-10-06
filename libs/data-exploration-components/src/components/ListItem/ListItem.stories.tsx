import React from 'react';

import { action } from '@storybook/addon-actions';
import { ComponentStory } from '@storybook/react';

import { ListItem } from './ListItem';

export default {
  title: 'Component/ListItem',
  component: ListItem,
  argTypes: {
    title: {
      type: 'string',
    },
    selected: {
      type: 'boolean',
    },
    bordered: {
      type: 'boolean',
    },
    children: {
      type: 'string',
    },
  },
};

export const Example: ComponentStory<typeof ListItem> = (args) => (
  <ListItem {...args} onClick={action('onClick')} />
);
Example.args = {
  title: 'Item',
  selected: false,
  bordered: false,
  children: 'Children',
};