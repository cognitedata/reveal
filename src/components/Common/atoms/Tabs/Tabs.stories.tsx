import React from 'react';
import { text } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { Tabs } from './Tabs';

export default { title: 'Atoms/Tabs', component: Tabs };

export const Simple = () => (
  <div style={{ padding: '40px', background: 'lightgrey' }}>
    <Tabs tab={text('tab', 'tab1')} onTabChange={action('onTabChange')}>
      <Tabs.Pane title="Hello World" key="tab1">
        <h1>Hello World</h1>
      </Tabs.Pane>
      <Tabs.Pane title="Hello World 2" key="tab2">
        <h1>Hello World 2</h1>
      </Tabs.Pane>
      <Tabs.Pane title="Hello World 3" key="tab3">
        <h1>Hello World 3</h1>
      </Tabs.Pane>
    </Tabs>
  </div>
);
