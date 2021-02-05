import React from 'react';
import { text } from '@storybook/addon-knobs';
import { ErrorFeedback } from './ErrorFeedback';

export default { title: 'Component/ErrorFeedback', component: ErrorFeedback };

export const Simple = () => (
  <div style={{ padding: '40px', background: 'lightgrey' }}>
    <ErrorFeedback error={text('error', 'error')} />
  </div>
);
