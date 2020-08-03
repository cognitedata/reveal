import React from 'react';
import { ListItem } from './ListItem';

export default { title: 'Atoms|ListItem' };
export const Simple = () => (
  <div style={{ padding: '40px', background: 'lightgrey' }}>
    <ListItem title="Item">
      <p>Something random</p>
    </ListItem>
    <ListItem selected title="Item Selected" />
  </div>
);
