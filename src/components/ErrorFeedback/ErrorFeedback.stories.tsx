import React from 'react';
import { ComponentStory } from '@storybook/react';
import { ErrorFeedback } from './ErrorFeedback';

export default {
  title: 'Component/ErrorFeedback',
  component: ErrorFeedback,
};

export const Simple: ComponentStory<typeof ErrorFeedback> = args => (
  <div>
    <ErrorFeedback {...args} />
  </div>
);
Simple.args = {
  error: { message: 'Event Id not found', requestId: '232423-4234-423432' },
};
