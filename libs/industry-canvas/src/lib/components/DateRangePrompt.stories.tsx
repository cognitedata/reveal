import { ComponentStory } from '@storybook/react';
import DateRangePrompt from './DateRangePrompt';

export default {
  title: 'Components/DateRangePrompt',
  component: DateRangePrompt,
};

export const Example: ComponentStory<typeof DateRangePrompt> = () => {
  return (
    <DateRangePrompt
      initialRange={{ startDate: new Date(), endDate: new Date() }}
      onComplete={(dateRange) => console.log('onComplete', dateRange)}
    />
  );
};
