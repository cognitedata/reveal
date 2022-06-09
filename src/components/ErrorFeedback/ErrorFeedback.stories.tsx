import React from 'react';
import { ComponentStory } from '@storybook/react';
import { ErrorFeedback } from './ErrorFeedback';

export default {
  title: 'Component/ErrorFeedback',
  component: ErrorFeedback,
  argTypes: { error: { control: 'text' } },
};

export const Simple: ComponentStory<typeof ErrorFeedback> = args => (
  <div style={{ padding: '40px', background: 'lightgrey' }}>
    <ErrorFeedback {...args} />
  </div>
);
Simple.args = { error: 'error' };
