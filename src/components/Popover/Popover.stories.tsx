import React from 'react';
import { Popover } from './Popover';

export default { title: 'Component/Popover', component: Popover };
export const Simple = () => (
  <Popover content={<div>Hello</div>}>
    <p>ASdasd</p>
  </Popover>
);
