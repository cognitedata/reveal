import React from 'react';
import { boolean, text } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { ListItem } from './ListItem';

export default { title: 'Atoms/ListItem', component: ListItem };
export const Example = () => (
  <div style={{ padding: '40px', background: 'lightgrey' }}>
    <ListItem title="Item">
      <p>Something random</p>
    </ListItem>
    <ListItem selected title="Item Selected" />
  </div>
);
export const Playground = () => (
  <div style={{ padding: '40px', background: 'lightgrey' }}>
    <ListItem
      title={text('title', 'Item')}
      selected={boolean('selected', false)}
      bordered={boolean('bordered', false)}
      onClick={action('onClick')}
    >
      {text('children', 'Children')}
    </ListItem>
  </div>
);
