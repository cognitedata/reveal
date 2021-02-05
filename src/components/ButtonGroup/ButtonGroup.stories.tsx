import React from 'react';
import { text } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { Button } from '@cognite/cogs.js';
import { ButtonGroup } from './ButtonGroup';

export default { title: 'Component/ButtonGroup', component: ButtonGroup };

export const Simple = () => (
  <div style={{ padding: '40px', background: 'lightgrey' }}>
    <ButtonGroup
      currentKey={text('currentKey', '1')}
      variant={text('variant', 'default') as 'default' | 'ghost'}
      onButtonClicked={action('onButtonClicked')}
    >
      <Button key="1">Button 1</Button>
      <Button key="2">Button 2</Button>
      <Button key="3">Button 3</Button>
    </ButtonGroup>
  </div>
);
