import { ComponentStory } from '@storybook/react';

import DateRangePrompt from './DateRangePrompt';

export default {
  title: 'Components/Date Range Prompt Story',
  component: DateRangePrompt,
};

export const DateRangePromptStory: ComponentStory<
  typeof DateRangePrompt
> = () => {
  return (
    <DateRangePrompt
      initialRange={{ startDate: new Date(), endDate: new Date() }}
      onComplete={(dateRange) => console.log('onComplete', dateRange)}
    />
  );
};
