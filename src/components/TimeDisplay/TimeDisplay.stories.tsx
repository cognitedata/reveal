import React from 'react';
import { object, boolean } from '@storybook/addon-knobs';
import { TimeDisplay } from './TimeDisplay';

export default { title: 'Component/TimeDisplay', component: TimeDisplay };
export const Example = () => (
  <TimeDisplay
    value={object('value', new Date())}
    withTooltip={boolean('withTooltip', true)}
    relative={boolean('relative', true)}
  />
);
