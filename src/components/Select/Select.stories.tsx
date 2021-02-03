import React from 'react';
import { action } from '@storybook/addon-actions';
import { boolean } from '@storybook/addon-knobs';
import { Select } from './Select';

export default { title: 'Component/Select', component: Select };
export const Example = () => (
  <Select
    onChange={action('onChange')}
    creatable={boolean('creatable', false)}
    isClearable={boolean('isClearable', true)}
    isSearchable={boolean('isSearchable', true)}
    options={[
      {
        label: 'hello',
        value: 'hello',
      },
    ]}
  />
);
